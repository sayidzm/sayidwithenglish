import type { Entry, EntryType, LearningStatus, Level } from "@/lib/mock-data";
import type { Tables } from "@/lib/supabase/database.types";
import type { SourceType } from "./types";

export const entryTypeToDb: Record<EntryType, string> = {
  Word: "word",
  Phrase: "phrase",
  "Phrasal Verb": "phrasal_verb",
  Sentence: "sentence",
};

const entryTypeFromDb: Record<string, EntryType> = {
  word: "Word",
  phrase: "Phrase",
  phrasal_verb: "Phrasal Verb",
  idiom: "Phrase",
  sentence: "Sentence",
  collocation: "Phrase",
  grammar_pattern: "Phrase",
  slang: "Phrase",
};

export const sourceTypeToDb: Record<string, SourceType> = {
  Dizi: "tv_series",
  Video: "youtube",
  Podcast: "podcast",
  Kitap: "book",
  Makale: "web",
  Manuel: "manual",
};

const sourceTypeFromDb: Record<SourceType, string> = {
  tv_series: "Dizi",
  movie: "Film",
  youtube: "Video",
  book: "Kitap",
  school: "Okul",
  podcast: "Podcast",
  web: "Makale",
  manual: "Manuel",
  other: "Diğer",
};

export function normalizeExpression(value: string): string {
  return value
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐‑–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^[\p{P}]+|[\p{P}]+$/gu, "");
}

export type VocabularyRows = {
  entries: Tables<"entries">[];
  meanings: Tables<"entry_meanings">[];
  examples: Tables<"entry_examples">[];
  similar: Tables<"similar_expressions">[];
  sources: Tables<"entry_sources">[];
  deckEntries: Tables<"deck_entries">[];
  entryTags: Tables<"entry_tags">[];
  decks: Tables<"decks">[];
  tags: Tables<"tags">[];
};

function status(row: Tables<"entries">): LearningStatus {
  if (row.is_difficult) return "Zor";
  if (row.is_mastered || row.learning_status === "mastered")
    return "Öğrenildi";
  return row.learning_status === "new" ? "Yeni" : "Öğreniliyor";
}

function sourceLabel(source: Tables<"entry_sources">): string {
  if (source.source_type === "tv_series") {
    const season = source.season_number
      ? `S${String(source.season_number).padStart(2, "0")}`
      : "";
    const episode = source.episode_number
      ? `E${String(source.episode_number).padStart(2, "0")}`
      : "";
    return [source.series_name || source.source_name, [season, episode].filter(Boolean).join(" ")]
      .filter(Boolean)
      .join(" · ");
  }
  return source.source_name || sourceTypeFromDb[source.source_type as SourceType] || "Manuel kayıt";
}

export function mapVocabularyRows(rows: VocabularyRows): Entry[] {
  const decks = new Map(rows.decks.map((deck) => [deck.id, deck.name]));
  const tags = new Map(rows.tags.map((tag) => [tag.id, tag.name]));
  return rows.entries.map((row) => {
    const source = rows.sources.find((item) => item.entry_id === row.id);
    return {
      id: row.id,
      expression: row.expression,
      type: entryTypeFromDb[row.entry_type] || "Phrase",
      level: (row.cefr_level || "B1") as Level,
      status: status(row),
      meanings: rows.meanings
        .filter((item) => item.entry_id === row.id)
        .sort((a, b) => a.meaning_order - b.meaning_order)
        .map((item) => item.meaning_tr),
      definition: row.english_explanation || "",
      ipa: row.pronunciation_ipa || "",
      pronunciationReadable: row.pronunciation_readable || "",
      originalInput: row.original_input || "",
      examples: rows.examples
        .filter((item) => item.entry_id === row.id)
        .sort((a, b) => a.example_order - b.example_order)
        .map((item) => ({ english: item.sentence_en, turkish: item.translation_tr })),
      similar: rows.similar
        .filter((item) => item.entry_id === row.id)
        .map((item) => item.expression),
      source: source ? sourceLabel(source) : "Manuel kayıt",
      sourceType: source
        ? sourceTypeFromDb[source.source_type as SourceType] || "Diğer"
        : "Manuel",
      sourceSentence: source?.source_sentence || "",
      date: row.created_at.slice(0, 10),
      decks: rows.deckEntries
        .filter((item) => item.entry_id === row.id)
        .map((item) => decks.get(item.deck_id))
        .filter((name): name is string => !!name),
      tags: rows.entryTags
        .filter((item) => item.entry_id === row.id)
        .map((item) => tags.get(item.tag_id))
        .filter((name): name is string => !!name),
      note: row.user_note || "",
    };
  });
}
