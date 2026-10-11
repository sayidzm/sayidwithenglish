"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { entryTypes, levels, type EntryType, type Level } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import { validateVocabularyItem } from "@/lib/ai/schemas";
import { createEntryFlashcards } from "@/lib/review/cards";
import { entryTypeToDb, normalizeExpression } from "./mappers";
import type {
  MutationResult,
  SaveResult,
  SourceType,
  VocabularyInput,
  VocabularyUpdate,
} from "./types";

type Client = Awaited<ReturnType<typeof createClient>>;
type Owner = {
  client: Client;
  userId: string;
  deckIds?: Map<string, string>;
  tagIds?: Map<string, string>;
};
const sourceTypes: SourceType[] = [
  "tv_series", "movie", "youtube", "book", "school", "podcast", "web", "manual", "other",
];
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max;
}

function names(value: unknown, max: number): value is string[] {
  return Array.isArray(value) && value.length <= 30 &&
    value.every((item: unknown) => text(item, max) && item.trim().length > 0);
}

function validUpdate(value: unknown): value is VocabularyUpdate {
  if (!object(value)) return false;
  return text(value.expression, 2000) && !!normalizeExpression(value.expression) &&
    entryTypes.includes(value.entryType as EntryType) &&
    levels.includes(value.cefrLevel as Level) &&
    text(value.englishExplanation, 10000) &&
    text(value.pronunciationIpa, 500) &&
    text(value.pronunciationReadable, 500) &&
    text(value.userNote, 10000);
}

function validInput(value: unknown): value is VocabularyInput {
  if (!object(value) || !validUpdate(value)) return false;
  const candidate: Record<string, unknown> = value as unknown as Record<string, unknown>;
  if (!text(candidate.originalInput, 10000) ||
    !names(candidate.meanings, 1000) ||
    !names(candidate.similar, 500) ||
    !names(candidate.decks, 120) ||
    !names(candidate.tags, 80) ||
    !Array.isArray(candidate.examples) || candidate.examples.length > 30 ||
    !candidate.examples.every((example: unknown) =>
      object(example) && text(example.english, 3000) && !!example.english.trim() &&
      text(example.turkish, 3000) && !!example.turkish.trim())) return false;
  if (candidate.source === null) return true;
  if (!object(candidate.source)) return false;
  const source = candidate.source;
  return sourceTypes.includes(source.type as SourceType) &&
    text(source.name, 500) && text(source.seriesName, 500) &&
    text(source.sentence, 3000) &&
    [source.seasonNumber, source.episodeNumber].every((number) =>
      number === null || (typeof number === "number" && Number.isInteger(number) && number > 0 && number < 1000));
}

async function existingDuplicate({ client, userId }: Owner, expression: string) {
  const { data } = await client.from("entries")
    .select("id")
    .eq("user_id", userId)
    .eq("normalized_expression", normalizeExpression(expression))
    .is("deleted_at", null)
    .maybeSingle();
  return data?.id;
}

async function ensureDeck(owner: Owner, name: string): Promise<string> {
  if (!owner.deckIds) {
    const { data, error } = await owner.client.from("decks")
      .select("id, name").eq("user_id", owner.userId);
    if (error) throw new Error("Deck bilgileri okunamadı.");
    owner.deckIds = new Map((data || []).map((item) => [item.name.toLowerCase(), item.id]));
  }
  const key = name.toLowerCase();
  const match = owner.deckIds.get(key);
  if (match) return match;
  const { data, error } = await owner.client.from("decks")
    .insert({ name }).select("id").single();
  if (!error && data) {
    owner.deckIds.set(key, data.id);
    return data.id;
  }
  if (error?.code === "23505") {
    const retry = await owner.client.from("decks").select("id, name").eq("user_id", owner.userId);
    const found = retry.data?.find((item) => item.name.toLowerCase() === key);
    if (found) {
      owner.deckIds.set(key, found.id);
      return found.id;
    }
  }
  throw new Error("Deck kaydedilemedi.");
}

async function ensureTag(owner: Owner, name: string): Promise<string> {
  if (!owner.tagIds) {
    const { data, error } = await owner.client.from("tags")
      .select("id, name").eq("user_id", owner.userId);
    if (error) throw new Error("Etiket bilgileri okunamadı.");
    owner.tagIds = new Map((data || []).map((item) => [item.name.toLowerCase(), item.id]));
  }
  const key = name.toLowerCase();
  const match = owner.tagIds.get(key);
  if (match) return match;
  const { data, error } = await owner.client.from("tags")
    .insert({ name }).select("id").single();
  if (!error && data) {
    owner.tagIds.set(key, data.id);
    return data.id;
  }
  if (error?.code === "23505") {
    const retry = await owner.client.from("tags").select("id, name").eq("user_id", owner.userId);
    const found = retry.data?.find((item) => item.name.toLowerCase() === key);
    if (found) {
      owner.tagIds.set(key, found.id);
      return found.id;
    }
  }
  throw new Error("Etiket kaydedilemedi.");
}

async function saveRelations(owner: Owner, id: string, input: VocabularyInput) {
  const { client } = owner;
  if (input.meanings.length) {
    const { error } = await client.from("entry_meanings").insert(
      input.meanings.map((meaning, index) => ({
        entry_id: id,
        meaning_tr: meaning.trim(),
        meaning_order: index,
        is_primary: index === 0,
      })),
    );
    if (error) throw new Error("Anlamlar kaydedilemedi.");
  }
  if (input.examples.length) {
    const { error } = await client.from("entry_examples").insert(
      input.examples.map((example, index) => ({
        entry_id: id,
        sentence_en: example.english.trim(),
        translation_tr: example.turkish.trim(),
        example_order: index,
        is_user_added: true,
      })),
    );
    if (error) throw new Error("Örnek cümleler kaydedilemedi.");
  }
  if (input.similar.length) {
    const { error } = await client.from("similar_expressions").insert(
      [...new Set(input.similar.map((item) => item.trim()))].map((expression) => ({
        entry_id: id,
        expression,
        relationship_type: "related",
      })),
    );
    if (error) throw new Error("Benzer ifadeler kaydedilemedi.");
  }
  if (input.source) {
    const { error } = await client.from("entry_sources").insert({
      entry_id: id,
      source_type: input.source.type,
      source_name: input.source.name.trim() || null,
      series_name: input.source.seriesName.trim() || null,
      season_number: input.source.seasonNumber,
      episode_number: input.source.episodeNumber,
      source_sentence: input.source.sentence.trim() || null,
    });
    if (error) throw new Error("Kaynak bilgileri kaydedilemedi.");
  }
  for (const name of new Set(input.decks.map((item) => item.trim()))) {
    const deckId = await ensureDeck(owner, name);
    const { error } = await client.from("deck_entries").insert({ deck_id: deckId, entry_id: id });
    if (error && error.code !== "23505") throw new Error("Deck ilişkisi kaydedilemedi.");
  }
  for (const name of new Set(input.tags.map((item) => item.trim()))) {
    const tagId = await ensureTag(owner, name);
    const { error } = await client.from("entry_tags").insert({ tag_id: tagId, entry_id: id });
    if (error && error.code !== "23505") throw new Error("Etiket ilişkisi kaydedilemedi.");
  }
}

export async function createVocabularyEntries(input: unknown): Promise<SaveResult> {
  const user = await requireUser();
  if (!Array.isArray(input) || input.length < 1 || input.length > 20 ||
    !input.every(validInput)) {
    return { savedCount: 0, failures: [{ expression: "", message: "Kayıt alanlarını kontrol et (en fazla 20 ifade)." }] };
  }
  const owner = { client: await createClient(), userId: user.id };
  const result: SaveResult = { savedCount: 0, failures: [] };
  for (const item of input) {
    const expression = item.expression.trim();
    let aiMetadata: Record<string, string | number | string[] | null> = {};
    if (item.aiJobItemId) {
      const { data: processed } = await owner.client.from("ai_job_items")
        .select("raw_input,status,result_json")
        .eq("id", item.aiJobItemId).eq("user_id", user.id).maybeSingle();
      if (!processed || processed.status !== "completed" ||
          !validateVocabularyItem(processed.result_json, processed.raw_input) ||
          normalizeExpression(processed.raw_input) !== normalizeExpression(expression)) {
        result.failures.push({ expression, message: "AI sonucu doğrulanamadı. Yeniden işle." });
        continue;
      }
      aiMetadata = {
        model: process.env.AI_MODEL || "unknown",
        confidence: processed.result_json.confidence,
        warnings: processed.result_json.warnings,
        detected_pattern: processed.result_json.detected_pattern,
      };
    }
    const { data, error } = await owner.client.from("entries").insert({
      expression,
      entry_type: entryTypeToDb[item.entryType],
      cefr_level: item.cefrLevel,
      english_explanation: item.englishExplanation.trim() || null,
      pronunciation_ipa: item.pronunciationIpa.trim() || null,
      pronunciation_readable: item.pronunciationReadable.trim() || null,
      original_input: item.originalInput.trim() || expression,
      user_note: item.userNote.trim() || null,
      ai_generated: !!item.aiJobItemId,
      ai_metadata: aiMetadata,
    }).select("id").single();
    if (error || !data) {
      result.failures.push({
        expression,
        message: error?.code === "23505" ? "Bu ifade zaten mevcut." : "Kayıt oluşturulamadı. Tekrar dene.",
        duplicateId: error?.code === "23505" ? await existingDuplicate(owner, expression) : undefined,
      });
      continue;
    }
    try {
      await saveRelations(owner, data.id, item);
      await createEntryFlashcards(data.id, user.id, item);
      result.savedCount += 1;
    } catch (reason) {
      // PostgREST cannot commit writes to multiple tables as one transaction.
      // Hide the incomplete parent rather than exposing a partially built entry.
      const cleanup = await owner.client.from("entries")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", data.id).eq("user_id", user.id).select("id").maybeSingle();
      result.failures.push({
        expression,
        message: cleanup.error || !cleanup.data
          ? "Kayıt kısmen yazıldı; lütfen tekrar kaydetmeden önce kütüphaneni kontrol et."
          : `${reason instanceof Error ? reason.message : "İlişkili bilgiler kaydedilemedi."} Eksik kayıt kütüphaneden kaldırıldı.`,
      });
    }
  }
  if (result.savedCount) {
    for (const path of ["/library", "/dashboard", "/statistics", "/review", "/learn", "/tutor"])
      revalidatePath(path);
  }
  return result;
}

export async function updateVocabularyEntry(id: unknown, input: unknown): Promise<MutationResult> {
  const user = await requireUser();
  if (typeof id !== "string" || !uuid.test(id) || !validUpdate(input))
    return { ok: false, message: "Kayıt alanlarını kontrol et." };
  const client = await createClient();
  const { data, error } = await client.from("entries").update({
    expression: input.expression.trim(),
    entry_type: entryTypeToDb[input.entryType],
    cefr_level: input.cefrLevel,
    english_explanation: input.englishExplanation.trim() || null,
    pronunciation_ipa: input.pronunciationIpa.trim() || null,
    pronunciation_readable: input.pronunciationReadable.trim() || null,
    user_note: input.userNote.trim() || null,
  }).eq("id", id).eq("user_id", user.id).is("deleted_at", null)
    .select("id").maybeSingle();
  if (error?.code === "23505")
    return { ok: false, message: "Bu ifade zaten mevcut.", duplicateId: await existingDuplicate({ client, userId: user.id }, input.expression) };
  if (error) return { ok: false, message: "Değişiklikler kaydedilemedi. Tekrar dene." };
  if (!data) return { ok: false, message: "Kayıt bulunamadı veya erişim iznin yok." };
  revalidatePath("/library");
  return { ok: true };
}

export async function softDeleteVocabularyEntry(id: unknown): Promise<MutationResult> {
  const user = await requireUser();
  if (typeof id !== "string" || !uuid.test(id))
    return { ok: false, message: "Kayıt bulunamadı." };
  const client = await createClient();
  const { data, error } = await client.from("entries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", user.id).is("deleted_at", null)
    .select("id").maybeSingle();
  if (error) return { ok: false, message: "Kayıt silinemedi. Tekrar dene." };
  if (!data) return { ok: false, message: "Kayıt bulunamadı veya erişim iznin yok." };
  revalidatePath("/library");
  return { ok: true };
}
