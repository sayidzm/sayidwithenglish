import "server-only";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/profile/profile";
import { createClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/lib/supabase/database.types";
import { previewSchedule, type ReviewRating } from "./scheduler";

export type ReviewCard = {
  id: string; entryId: string; expression: string; type: string; level: string;
  ipa: string; meanings: string[]; example: { english: string; turkish: string } | null;
  cardType: string; front: Json; back: Json;
  schedule: Record<ReviewRating, string>;
};
export type ReviewQueue = {
  cards: ReviewCard[]; completedToday: number; goal: number;
  newRemaining: number; error?: string;
};

/** Profile timezone support can replace this project-local day boundary later. */
export function istanbulDayBounds(now = new Date()) {
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul",
    year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const start = new Date(`${date}T00:00:00+03:00`);
  return { start: start.toISOString(), end: new Date(start.getTime() + 86_400_000).toISOString() };
}

export async function getReviewQueue(): Promise<ReviewQueue> {
  const [user, profile] = await Promise.all([requireUser(), getProfile()]);
  const client = await createClient();
  const now = new Date();
  const bounds = istanbulDayBounds(now);
  const [today, due, fresh] = await Promise.all([
    client.from("review_history").select("flashcard_id")
      .eq("user_id", user.id).gte("reviewed_at", bounds.start)
      .lt("reviewed_at", bounds.end).limit(1000),
    client.from("review_state").select("*")
      .eq("user_id", user.id).neq("state", "new")
      .lte("due_at", now.toISOString()).order("due_at").limit(250),
    client.from("review_state").select("*")
      .eq("user_id", user.id).eq("state", "new")
      .order("created_at").limit(50),
  ]);
  if (today.error || due.error || fresh.error)
    return { cards: [], completedToday: 0, goal: profile.daily_review_goal,
      newRemaining: 0, error: "Tekrarlar yüklenemedi. Sayfayı yenile." };
  const todayRows = today.data || [];
  const dailyCounts = new Map<string, number>();
  for (const row of todayRows)
    dailyCounts.set(row.flashcard_id, (dailyCounts.get(row.flashcard_id) || 0) + 1);
  let newUsed = 0;
  if (dailyCounts.size) {
    const { data: reviewedStates } = await client.from("review_state")
      .select("flashcard_id,review_count").eq("user_id", user.id)
      .in("flashcard_id", [...dailyCounts.keys()]);
    newUsed = (reviewedStates || []).filter((state) =>
      state.review_count === dailyCounts.get(state.flashcard_id)).length;
  }
  const goal = profile.daily_review_goal;
  const newRemaining = Math.max(0, profile.daily_new_card_limit - newUsed);
  const limit = Math.max(0, goal - todayRows.length);
  const states = [
    ...(due.data || []).sort((a, b) =>
      Number(b.state === "relearning") - Number(a.state === "relearning")),
    ...(fresh.data || []).slice(0, newRemaining),
  ].slice(0, limit);
  if (!states.length) return { cards: [], completedToday: todayRows.length, goal, newRemaining };
  const { data: cards, error: cardError } = await client.from("flashcards").select("*")
    .eq("user_id", user.id).eq("is_enabled", true)
    .in("id", states.map((state) => state.flashcard_id));
  if (cardError) return { cards: [], completedToday: todayRows.length, goal,
    newRemaining, error: "Kartlar yüklenemedi." };
  const cardMap = new Map((cards || []).map((card) => [card.id, card]));
  const entryIds = [...new Set((cards || []).map((card) => card.entry_id))];
  if (!entryIds.length) return { cards: [], completedToday: todayRows.length, goal, newRemaining };
  const { data: entries, error: entryError } = await client.from("entries")
    .select("id,expression,entry_type,cefr_level,pronunciation_ipa,is_difficult,deleted_at,entry_meanings(meaning_tr,meaning_order),entry_examples(sentence_en,translation_tr,example_order)")
    .eq("user_id", user.id).is("deleted_at", null).in("id", entryIds);
  if (entryError) return { cards: [], completedToday: todayRows.length, goal,
    newRemaining, error: "Kart içerikleri yüklenemedi." };
  const entryMap = new Map((entries || []).map((entry) => [entry.id, entry]));
  return {
    completedToday: todayRows.length, goal, newRemaining,
    cards: states.flatMap((state): ReviewCard[] => {
      const card = cardMap.get(state.flashcard_id);
      const entry = card && entryMap.get(card.entry_id);
      if (!card || !entry) return [];
      const example = [...entry.entry_examples]
        .sort((a, b) => a.example_order - b.example_order)[0];
      return [{
        id: card.id, entryId: entry.id, expression: entry.expression,
        type: entry.entry_type, level: entry.cefr_level || "B1",
        ipa: entry.pronunciation_ipa || "",
        meanings: [...entry.entry_meanings].sort((a, b) => a.meaning_order - b.meaning_order)
          .map((meaning) => meaning.meaning_tr),
        example: example ? { english: example.sentence_en, turkish: example.translation_tr } : null,
        cardType: card.card_type, front: card.front_data, back: card.back_data,
        schedule: previewSchedule(state as Tables<"review_state">, now),
      }];
    }),
  };
}
