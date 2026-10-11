import { normalizeExpression } from "@/lib/vocabulary/mappers";

export const vocabularyResponseSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          expression: { type: "string" },
          normalized_expression: { type: "string" },
          type: { type: "string", enum: ["word", "phrase", "phrasal_verb", "sentence"] },
          cefr_level: { type: "string", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
          english_explanation: { type: "string" },
          pronunciation: {
            type: "object",
            properties: { ipa: { type: "string" }, readable: { type: "string" } },
            required: ["ipa", "readable"],
          },
          meanings: {
            type: "array",
            items: { type: "object", properties: {
              meaning_tr: { type: "string" }, primary: { type: "boolean" }, usage_note: { type: "string" },
            }, required: ["meaning_tr", "primary", "usage_note"] },
          },
          examples: {
            type: "array",
            items: { type: "object", properties: {
              sentence_en: { type: "string" }, translation_tr: { type: "string" },
              level: { type: "string", enum: ["A1", "A2", "B1", "B2", "C1", "C2"] },
            }, required: ["sentence_en", "translation_tr", "level"] },
          },
          similar_expressions: {
            type: "array",
            items: { type: "object", properties: {
              expression: { type: "string" }, meaning_tr: { type: "string" },
              relationship: { type: "string", enum: ["synonym", "related", "opposite"] },
            }, required: ["expression", "meaning_tr", "relationship"] },
          },
          detected_pattern: { type: ["string", "null"] },
          original_sentence: { type: ["string", "null"] },
          confidence: { type: "number" },
          warnings: { type: "array", items: { type: "string" } },
        },
        required: ["expression", "normalized_expression", "type", "cefr_level",
          "english_explanation", "pronunciation", "meanings", "examples",
          "similar_expressions", "detected_pattern", "original_sentence",
          "confidence", "warnings"],
      },
    },
  },
  required: ["items"],
} as const;

export type ProcessedVocabulary = {
  expression: string;
  normalized_expression: string;
  type: "word" | "phrase" | "phrasal_verb" | "sentence";
  cefr_level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  english_explanation: string;
  pronunciation: { ipa: string; readable: string };
  meanings: { meaning_tr: string; primary: boolean; usage_note: string }[];
  examples: { sentence_en: string; translation_tr: string; level: string }[];
  similar_expressions: { expression: string; meaning_tr: string; relationship: string }[];
  detected_pattern: string | null;
  original_sentence: string | null;
  confidence: number;
  warnings: string[];
};

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function string(value: unknown, max: number, required = false): value is string {
  return typeof value === "string" && value.length <= max && (!required || !!value.trim());
}
const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
const types = ["word", "phrase", "phrasal_verb", "sentence"];

/** The model's JSON is untrusted even when responseFormat uses a schema. */
export function validateVocabularyItem(value: unknown, expected: string): value is ProcessedVocabulary {
  if (!record(value) || !string(value.expression, 2000, true) ||
      normalizeExpression(value.expression) !== normalizeExpression(expected) ||
      !string(value.normalized_expression, 2000, true) ||
      value.normalized_expression !== normalizeExpression(expected) ||
      !types.includes(String(value.type)) || !levels.includes(String(value.cefr_level)) ||
      !string(value.english_explanation, 10000, true) ||
      !record(value.pronunciation) ||
      !string(value.pronunciation.ipa, 500) ||
      !string(value.pronunciation.readable, 500) ||
      !Array.isArray(value.meanings) || value.meanings.length < 1 || value.meanings.length > 8 ||
      !value.meanings.every((meaning: unknown) => record(meaning) &&
        string(meaning.meaning_tr, 1000, true) && typeof meaning.primary === "boolean" &&
        string(meaning.usage_note, 1000)) ||
      !Array.isArray(value.examples) || value.examples.length < 2 || value.examples.length > 3 ||
      !value.examples.every((example: unknown) => record(example) &&
        string(example.sentence_en, 3000, true) &&
        string(example.translation_tr, 3000, true) && levels.includes(String(example.level))) ||
      !Array.isArray(value.similar_expressions) || value.similar_expressions.length > 8 ||
      !value.similar_expressions.every((similar: unknown) => record(similar) &&
        string(similar.expression, 500, true) && string(similar.meaning_tr, 500) &&
        ["synonym", "related", "opposite"].includes(String(similar.relationship))) ||
      !(value.detected_pattern === null || string(value.detected_pattern, 1000)) ||
      !(value.original_sentence === null || string(value.original_sentence, 3000)) ||
      typeof value.confidence !== "number" || !Number.isFinite(value.confidence) ||
      value.confidence < 0 || value.confidence > 1 ||
      !Array.isArray(value.warnings) || value.warnings.length > 8 ||
      !value.warnings.every((warning: unknown) => string(warning, 500))) return false;
  return true;
}

export const tutorResponseSchema = {
  type: "object",
  properties: {
    reply: { type: "string" },
    correction: {
      type: ["object", "null"],
      properties: {
        original: { type: "string" }, corrected: { type: "string" },
        reason: { type: "string" }, natural: { type: "string" },
      },
      required: ["original", "corrected", "reason", "natural"],
    },
  },
  required: ["reply", "correction"],
} as const;

export type TutorOutput = {
  reply: string;
  correction: null | { original: string; corrected: string; reason: string; natural: string };
};

export function validateTutorOutput(value: unknown): value is TutorOutput {
  if (!record(value) || !string(value.reply, 4000, true)) return false;
  if (value.correction === null) return true;
  return record(value.correction) &&
    string(value.correction.original, 2000, true) &&
    string(value.correction.corrected, 2000, true) &&
    string(value.correction.reason, 2000, true) &&
    string(value.correction.natural, 2000, true);
}
