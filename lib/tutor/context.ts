import "server-only";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/profile/profile";
import { createClient } from "@/lib/supabase/server";

export type TutorWord = { id: string; expression: string; meaning: string; type: string };
export type TutorContext = {
  level: string; recent: TutorWord[]; difficult: TutorWord[];
  mistakes: { expression: string; timesMissed: number }[];
  activeDeck: { name: string; count: number } | null;
  recentlyReviewed: string[];
};

export async function getTutorContext(): Promise<TutorContext> {
  const [user, profile] = await Promise.all([requireUser(), getProfile()]);
  const client = await createClient();
  const [recentRows, difficultRows, mistakeRows, deckRows, reviewRows] = await Promise.all([
    client.from("entries")
      .select("id,expression,entry_type,entry_meanings(meaning_tr,meaning_order)")
      .eq("user_id", user.id).is("deleted_at", null)
      .order("created_at", { ascending: false }).limit(20),
    client.from("entries")
      .select("id,expression,entry_type,entry_meanings(meaning_tr,meaning_order)")
      .eq("user_id", user.id).eq("is_difficult", true).is("deleted_at", null)
      .order("updated_at", { ascending: false }).limit(8),
    client.from("mistakes").select("entry_id,times_missed")
      .eq("user_id", user.id).eq("resolved", false)
      .order("last_missed_at", { ascending: false }).limit(8),
    client.from("decks").select("id,name")
      .eq("user_id", user.id).eq("is_archived", false)
      .order("created_at", { ascending: false }).limit(1),
    client.from("review_history").select("flashcard_id")
      .eq("user_id", user.id).order("reviewed_at", { ascending: false }).limit(12),
  ]);
  if (recentRows.error || difficultRows.error || mistakeRows.error || deckRows.error || reviewRows.error)
    throw new Error("Tutor bağlamı yüklenemedi.");
  const toWord = (row: NonNullable<typeof recentRows.data>[number]): TutorWord => ({
    id: row.id, expression: row.expression, type: row.entry_type,
    meaning: [...row.entry_meanings]
      .sort((a, b) => a.meaning_order - b.meaning_order)[0]?.meaning_tr || "",
  });
  const recent = (recentRows.data || []).map(toWord);
  const difficult = (difficultRows.data || []).map(toWord);
  const otherIds = [...new Set((mistakeRows.data || []).map((row) => row.entry_id))];
  const { data: mistakeEntries } = otherIds.length ? await client.from("entries")
    .select("id,expression").eq("user_id", user.id).is("deleted_at", null).in("id", otherIds)
    : { data: [] as { id: string; expression: string }[] };
  const mistakeMap = new Map((mistakeEntries || []).map((entry) => [entry.id, entry.expression]));
  const mistakes = (mistakeRows.data || []).flatMap((row) => {
    const expression = mistakeMap.get(row.entry_id);
    return expression ? [{ expression, timesMissed: row.times_missed }] : [];
  });
  const deck = deckRows.data?.[0];
  const { count } = deck ? await client.from("deck_entries")
    .select("id", { count: "exact", head: true }).eq("deck_id", deck.id)
    : { count: 0 };
  const cardIds = [...new Set((reviewRows.data || []).map((row) => row.flashcard_id))];
  const { data: reviewedCards } = cardIds.length ? await client.from("flashcards")
    .select("entry_id").eq("user_id", user.id).in("id", cardIds)
    : { data: [] as { entry_id: string }[] };
  const reviewedEntryIds = [...new Set((reviewedCards || []).map((card) => card.entry_id))];
  const { data: reviewedEntries } = reviewedEntryIds.length ? await client.from("entries")
    .select("expression").eq("user_id", user.id).is("deleted_at", null).in("id", reviewedEntryIds)
    : { data: [] as { expression: string }[] };
  return {
    level: profile.current_level, recent, difficult, mistakes,
    activeDeck: deck ? { name: deck.name, count: count || 0 } : null,
    recentlyReviewed: (reviewedEntries || []).map((entry) => entry.expression),
  };
}
