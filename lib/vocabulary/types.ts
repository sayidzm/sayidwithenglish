import type { EntryType, Example, Level } from "@/lib/mock-data";

export type SourceType =
  | "tv_series"
  | "movie"
  | "youtube"
  | "book"
  | "school"
  | "podcast"
  | "web"
  | "manual"
  | "other";

export type VocabularyInput = {
  aiJobItemId?: string;
  expression: string;
  entryType: EntryType;
  cefrLevel: Level;
  englishExplanation: string;
  pronunciationIpa: string;
  pronunciationReadable: string;
  originalInput: string;
  userNote: string;
  meanings: string[];
  examples: Example[];
  similar: string[];
  source: {
    type: SourceType;
    name: string;
    seriesName: string;
    seasonNumber: number | null;
    episodeNumber: number | null;
    sentence: string;
  } | null;
  decks: string[];
  tags: string[];
};

export type SaveFailure = {
  expression: string;
  message: string;
  duplicateId?: string;
};

export type VocabularyUpdate = Pick<
  VocabularyInput,
  | "expression"
  | "entryType"
  | "cefrLevel"
  | "englishExplanation"
  | "pronunciationIpa"
  | "pronunciationReadable"
  | "userNote"
>;

export type SaveResult = {
  savedCount: number;
  failures: SaveFailure[];
};

export type MutationResult =
  | { ok: true }
  | { ok: false; message: string; duplicateId?: string };
