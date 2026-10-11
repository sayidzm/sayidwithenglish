import "server-only";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { mapVocabularyRows, type VocabularyRows } from "./mappers";
import type { Entry } from "@/lib/mock-data";

const PAGE_SIZE = 200;

/** Request-time data, scoped by both the Auth user and database RLS. */
export async function listVocabularyEntries(): Promise<
  { entries: Entry[]; error: null } | { entries: []; error: string }
> {
  const user = await requireUser();
  const supabase = await createClient();
  const rows: VocabularyRows = {
    entries: [],
    meanings: [],
    examples: [],
    similar: [],
    sources: [],
    deckEntries: [],
    entryTags: [],
    decks: [],
    tags: [],
  };
  const decks = new Map<string, VocabularyRows["decks"][number]>();
  const tags = new Map<string, VocabularyRows["tags"][number]>();
  try {
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("entries")
        .select(`
          *,
          entry_meanings (*),
          entry_examples (*),
          similar_expressions (*),
          entry_sources (*),
          deck_entries (*, decks (*)),
          entry_tags (*, tags (*))
        `)
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      for (const item of data ?? []) {
        rows.entries.push(item);
        rows.meanings.push(...item.entry_meanings);
        rows.examples.push(...item.entry_examples);
        rows.similar.push(...item.similar_expressions);
        rows.sources.push(...item.entry_sources);
        for (const link of item.deck_entries) {
          rows.deckEntries.push({
            id: link.id,
            entry_id: link.entry_id,
            deck_id: link.deck_id,
            created_at: link.created_at,
          });
          if (link.decks) decks.set(link.decks.id, link.decks);
        }
        for (const link of item.entry_tags) {
          rows.entryTags.push({
            entry_id: link.entry_id,
            tag_id: link.tag_id,
          });
          if (link.tags) tags.set(link.tags.id, link.tags);
        }
      }
      if (!data || data.length < PAGE_SIZE) break;
    }
    rows.decks = [...decks.values()];
    rows.tags = [...tags.values()];
    return { entries: mapVocabularyRows(rows), error: null };
  } catch {
    return { entries: [], error: "Kayıtlar yüklenemedi. Lütfen tekrar dene." };
  }
}
