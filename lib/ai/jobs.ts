"use server";

import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/profile/profile";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import { normalizeExpression } from "@/lib/vocabulary/mappers";
import type { VocabularyInput } from "@/lib/vocabulary/types";
import { AiError, generateJson } from "./google";
import { vocabularyPrompt, vocabularySystemPrompt } from "./prompts";
import { validateVocabularyItem, vocabularyResponseSchema, type ProcessedVocabulary } from "./schemas";

type ItemStatus = "queued" | "processing" | "completed" | "duplicate" | "failed";
export type JobItem = {
  id: string; expression: string; status: ItemStatus;
  draft?: VocabularyInput; duplicateId?: string; error?: string;
};
export type JobStatus = {
  id: string; status: string; total: number; processed: number;
  failed: number; items: JobItem[];
};
type StartResult = { ok: true; job: JobStatus } | { ok: false; message: string };

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function friendlyError(error: unknown): string {
  if (error instanceof AiError) {
    if (error.code === "rate_limit") return "AI kullanım sınırına ulaşıldı. Biraz sonra tekrar dene.";
    if (error.code === "invalid_key") return "AI yapılandırması geçersiz. API anahtarını kontrol edip tekrar dene.";
    if (error.code === "forbidden") return "AI erişimi reddedildi.";
    if (error.code === "model_not_found") return "Seçili AI modeli kullanılamıyor.";
    if (error.code === "service_unavailable")
      return "AI servisi geçici bir sorun yaşıyor. İşleme devam et ile sürdürebilirsin.";
    if (error.code === "network") return "AI servisine bağlanılamadı. Daha sonra tekrar dene.";
    if (error.code === "unavailable") return "AI hizmeti şu anda kullanılamıyor. Girdilerin korundu.";
  }
  return "AI yanıtı beklenen formatta değildi. Yeniden deneniyor.";
}
// Exactly one controlled retry for transient failures (malformed response,
// temporary 5xx, network timeout). Config/auth failures never retry.
function isRetryable(error: unknown): boolean {
  return error instanceof AiError &&
    (error.code === "invalid_response" || error.code === "network" || error.code === "service_unavailable");
}
function toDraft(item: ProcessedVocabulary, jobItemId: string): VocabularyInput {
  const type = item.type === "phrasal_verb" ? "Phrasal Verb" :
    item.type === "word" ? "Word" : item.type === "sentence" ? "Sentence" : "Phrase";
  return {
    aiJobItemId: jobItemId,
    expression: item.expression,
    entryType: type,
    cefrLevel: item.cefr_level,
    englishExplanation: item.english_explanation,
    pronunciationIpa: item.pronunciation.ipa,
    pronunciationReadable: item.pronunciation.readable,
    originalInput: item.expression,
    userNote: "",
    meanings: item.meanings.map((meaning) => meaning.meaning_tr),
    examples: item.examples.map((example) => ({ english: example.sentence_en, turkish: example.translation_tr })),
    similar: item.similar_expressions.map((similar) => similar.expression),
    source: { type: "manual", name: "", seriesName: "",
      seasonNumber: null, episodeNumber: null,
      sentence: item.original_sentence || "" },
    decks: [], tags: [],
  };
}

async function ownedJob(jobId: string, userId: string) {
  const client = await createClient();
  const { data } = await client.from("ai_jobs").select("id,status,total_items")
    .eq("id", jobId).eq("user_id", userId).maybeSingle();
  return { client, job: data };
}

async function statusFor(jobId: string, userId: string): Promise<JobStatus | null> {
  const { client, job } = await ownedJob(jobId, userId);
  if (!job) return null;
  const { data, error } = await client.from("ai_job_items").select("*")
    .eq("job_id", jobId).eq("user_id", userId).order("created_at");
  if (error) throw new Error("İşlem durumu okunamadı.");
  const items = (data || []).map((row): JobItem => {
    const result = row.result_json;
    const draft = validateVocabularyItem(result, row.raw_input)
      ? toDraft(result, row.id) : undefined;
    return {
      id: row.id, expression: row.raw_input, status: row.status as ItemStatus,
      draft,
      duplicateId: record(result) && typeof result.duplicateId === "string" ? result.duplicateId : undefined,
      error: row.error_message || undefined,
    };
  });
  return {
    id: job.id, status: job.status, total: job.total_items,
    processed: items.filter((item) => item.status !== "queued" && item.status !== "processing").length,
    failed: items.filter((item) => item.status === "failed").length,
    items,
  };
}

export async function latestVocabularyJob(): Promise<JobStatus | null> {
  const user = await requireUser();
  const client = await createClient();
  const { data } = await client.from("ai_jobs").select("id")
    .eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data ? statusFor(data.id, user.id) : null;
}

export async function startVocabularyJob(input: unknown): Promise<StartResult> {
  const user = await requireUser();
  if (!Array.isArray(input) || input.length < 1 || input.length > 20 ||
      !input.every((item: unknown) => typeof item === "string" && item.trim().length > 0 && item.length <= 2000))
    return { ok: false, message: "Tek seferde 1–20 geçerli ifade girebilirsin." };
  const expressions = [...new Map(input.map((item: string) => [normalizeExpression(item), item.trim()])).values()];
  if (!expressions.every((item) => normalizeExpression(item)))
    return { ok: false, message: "İfadeleri kontrol et." };
  const client = await createClient();
  const { data: job, error } = await client.from("ai_jobs").insert({
    input_json: expressions, total_items: expressions.length, status: "queued",
  }).select("id").single();
  if (error || !job) return { ok: false, message: "AI işlemi başlatılamadı. Tekrar dene." };
  const normalized = expressions.map(normalizeExpression);
  const { data: duplicates } = await client.from("entries").select("id,normalized_expression")
    .eq("user_id", user.id).is("deleted_at", null).in("normalized_expression", normalized);
  const duplicateMap = new Map((duplicates || []).map((entry) => [entry.normalized_expression, entry.id]));
  // Reuse a prior validated result when the expression has not been saved yet.
  const { data: cached } = await client.from("ai_job_items")
    .select("normalized_input,result_json,raw_input")
    .eq("user_id", user.id).eq("status", "completed")
    .in("normalized_input", normalized).order("created_at", { ascending: false }).limit(40);
  const cache = new Map<string, ProcessedVocabulary>();
  for (const row of cached || []) {
    if (!cache.has(row.normalized_input) && validateVocabularyItem(row.result_json, row.raw_input))
      cache.set(row.normalized_input, row.result_json);
  }
  const rows = expressions.map((expression) => {
    const norm = normalizeExpression(expression);
    const duplicateId = duplicateMap.get(norm);
    const prior = cache.get(norm);
    return {
      job_id: job.id, raw_input: expression, normalized_input: norm,
      status: duplicateId ? "duplicate" : prior ? "completed" : "queued",
      result_json: duplicateId ? { duplicateId } : prior ? JSON.parse(JSON.stringify(prior)) as Json : null,
      error_message: duplicateId ? "Bu ifade zaten mevcut." : null,
    };
  });
  const inserted = await client.from("ai_job_items").insert(rows);
  if (inserted.error) {
    await client.from("ai_jobs").update({ status: "failed", failed_items: expressions.length,
      completed_at: new Date().toISOString() }).eq("id", job.id);
    return { ok: false, message: "İfadeler işleme alınamadı. Tekrar dene." };
  }
  const processed = rows.filter((row) => row.status !== "queued").length;
  if (processed === rows.length) await client.from("ai_jobs").update({
    status: rows.some((row) => row.status === "duplicate") ? "partial" : "completed",
    processed_items: processed, completed_at: new Date().toISOString(),
  }).eq("id", job.id).eq("user_id", user.id);
  const result = await statusFor(job.id, user.id);
  if (!result) return { ok: false, message: "İşlem durumu bulunamadı." };
  return { ok: true, job: result };
}

async function processBatch(expressions: string[], level: string, userId: string) {
  const response = await generateJson(userId, "vocabulary", vocabularySystemPrompt,
    vocabularyPrompt(expressions, level), vocabularyResponseSchema);
  if (!record(response) || !Array.isArray(response.items)) throw new AiError("invalid_response");
  return response.items as unknown[];
}

export async function processNextVocabularyChunk(jobId: unknown): Promise<JobStatus | null> {
  const user = await requireUser();
  if (typeof jobId !== "string" || !/^[0-9a-f-]{36}$/i.test(jobId)) return null;
  const { client, job } = await ownedJob(jobId, user.id);
  if (!job) return null;
  const { data: queued } = await client.from("ai_job_items").select("*")
    .eq("job_id", jobId).eq("user_id", user.id).eq("status", "queued")
    .order("created_at").limit(4);
  if (!queued?.length) return statusFor(jobId, user.id);
  const profile = await getProfile();
  await client.from("ai_jobs").update({ status: "processing", started_at: new Date().toISOString() })
    .eq("id", jobId).eq("user_id", user.id);
  const expressions = queued.map((item) => item.raw_input);
  let responses: unknown[] = [];
  let batchError: unknown;
  try { responses = await processBatch(expressions, profile.current_level, user.id); }
  catch (error) {
    batchError = error;
    if (isRetryable(error)) {
      try {
        responses = await processBatch(expressions, profile.current_level, user.id);
        batchError = undefined;
      } catch (retryError) { batchError = retryError; }
    }
  }

  for (const item of queued) {
    let match = responses.find((candidate) => record(candidate) &&
      typeof candidate.expression === "string" &&
      normalizeExpression(candidate.expression) === item.normalized_input);
    if (!validateVocabularyItem(match, item.raw_input) && !batchError) {
      // Exactly one controlled retry for malformed/missing items; valid peers survive.
      try {
        match = (await processBatch([item.raw_input], profile.current_level, user.id))[0];
      } catch (error) { batchError = error; }
    }
    const valid = validateVocabularyItem(match, item.raw_input);
    await client.from("ai_job_items").update({
      status: valid ? "completed" : "failed",
      result_json: valid ? JSON.parse(JSON.stringify(match)) as Json : null,
      error_message: valid ? null : friendlyError(batchError),
    }).eq("id", item.id).eq("user_id", user.id);
  }
  const result = await statusFor(jobId, user.id);
  if (!result) return null;
  const done = result.processed === result.total;
  await client.from("ai_jobs").update({
    status: done ? (result.failed === 0 && !result.items.some((item) => item.status === "duplicate")
      ? "completed" : result.failed === result.total ? "failed" : "partial") : "processing",
    processed_items: result.processed,
    failed_items: result.failed,
    completed_at: done ? new Date().toISOString() : null,
  }).eq("id", jobId).eq("user_id", user.id);
  return { ...result, status: done ? (result.failed ? "partial" : "completed") : "processing" };
}
