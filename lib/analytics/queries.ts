import "server-only";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/profile/profile";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

type EntryMetric = Pick<Tables<"entries">,
  "id" | "created_at" | "entry_type" | "cefr_level" | "is_difficult" | "is_mastered" | "learning_status">;
type HistoryMetric = Pick<Tables<"review_history">, "flashcard_id" | "reviewed_at" | "rating">;
type CardMetric = Pick<Tables<"flashcards">, "id" | "entry_id" | "is_enabled">;
type StateMetric = Pick<Tables<"review_state">, "flashcard_id" | "state" | "review_count">;
type SourceMetric = Pick<Tables<"entry_sources">, "entry_id" | "source_type">;
type MistakeMetric = Pick<Tables<"mistakes">, "entry_id" | "resolved">;
type DayPoint = { day: string; reviews: number; learned: number };
export type Analytics = {
  total: number; addedToday: number; difficult: number; learned: number;
  learning: number; newCount: number; accuracy: number; streak: number;
  todayReviews: number; todayGood: number; todayHard: number; todayAgain: number;
  reviewGoal: number; weekly: DayPoint[]; previousWeekly: DayPoint[];
  monthly: DayPoint[]; heatmap: number[];
  difficultEntryIds: string[];
  cefr: { label: string; value: number }[];
  sources: { label: string; value: number }[];
  types: { label: string; value: number }[];
  difficultCategories: { label: string; value: number }[];
};

const localDate = (value: Date | string) => new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date(value));
const dayName = (value: Date) => new Intl.DateTimeFormat("tr-TR", {
  timeZone: "Europe/Istanbul", weekday: "short",
}).format(value);
const sourceLabels: Record<string, string> = {
  tv_series: "Diziler", movie: "Filmler", youtube: "Videolar", book: "Kitaplar",
  school: "Okul", podcast: "Podcast", web: "Web", manual: "Manuel", other: "Diğer",
};
const typeLabels: Record<string, string> = {
  word: "Kelime", phrase: "İfade", phrasal_verb: "Phrasal Verb", sentence: "Cümle",
  idiom: "Deyim", collocation: "Kalıp", grammar_pattern: "Dilbilgisi", slang: "Argo",
};

function points(days: number, offset: number, today: Date,
  reviews: Map<string, number>, added: Map<string, number>): DayPoint[] {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index + offset) * 86_400_000);
    const key = localDate(date);
    return { day: dayName(date), reviews: reviews.get(key) || 0,
      learned: added.get(key) || 0 };
  });
}

export function calculateAnalytics(data: {
  entries: EntryMetric[]; history: HistoryMetric[]; cards: CardMetric[];
  states: StateMetric[]; sources: SourceMetric[]; mistakes: MistakeMetric[];
  reviewGoal: number; now?: Date;
}): Analytics {
  const now = data.now || new Date();
  const today = localDate(now);
  const reviews = new Map<string, number>();
  const added = new Map<string, number>();
  const active = new Set<string>();
  let correct = 0;
  let todayGood = 0, todayHard = 0, todayAgain = 0;
  for (const entry of data.entries) {
    const key = localDate(entry.created_at);
    added.set(key, (added.get(key) || 0) + 1);
    active.add(key);
  }
  for (const log of data.history) {
    const key = localDate(log.reviewed_at);
    reviews.set(key, (reviews.get(key) || 0) + 1);
    active.add(key);
    if (log.rating !== "again") correct++;
    if (key === today) {
      if (log.rating === "again") todayAgain++;
      else if (log.rating === "hard") todayHard++;
      else todayGood++;
    }
  }
  const cardByEntry = new Map<string, string[]>();
  for (const card of data.cards.filter((card) => card.is_enabled))
    cardByEntry.set(card.entry_id, [...(cardByEntry.get(card.entry_id) || []), card.id]);
  const stateByCard = new Map(data.states.map((state) => [state.flashcard_id, state]));
  const difficultIds = new Set(data.mistakes.filter((mistake) => !mistake.resolved)
    .map((mistake) => mistake.entry_id));
  let learned = 0, learning = 0, newCount = 0, difficult = 0;
  for (const entry of data.entries) {
    const cards = cardByEntry.get(entry.id) || [];
    const progress = cards.map((id) => stateByCard.get(id));
    const mastered = cards.length > 0 && progress.every((state) =>
      state?.state === "review" && state.review_count >= 3);
    if (mastered || entry.is_mastered) learned++;
    else if (progress.some((state) => (state?.review_count || 0) > 0)) learning++;
    else newCount++;
    if (entry.is_difficult || difficultIds.has(entry.id)) difficult++;
  }
  let streak = 0;
  for (let offset = active.has(today) ? 0 : 1; offset < 366; offset++) {
    if (!active.has(localDate(new Date(now.getTime() - offset * 86_400_000)))) break;
    streak++;
  }
  const distribution = (pairs: string[], labels: Record<string, string>) =>
    Object.entries(labels).map(([key, label]) =>
      ({ label, value: pairs.filter((value) => value === key).length }))
      .filter((item) => item.value > 0);
  const activeIds = new Set(data.entries.map((entry) => entry.id));
  const sourceCounts = distribution(data.sources.filter((source) => activeIds.has(source.entry_id))
    .map((source) => source.source_type), sourceLabels);
  const sourceTotal = sourceCounts.reduce((total, item) => total + item.value, 0);
  const sourcePercent = sourceCounts.map((item) => ({ ...item,
    value: Math.round(item.value / Math.max(1, sourceTotal) * 100) }));
  const difficultEntries = data.entries.filter((entry) => entry.is_difficult || difficultIds.has(entry.id));
  return {
    total: data.entries.length, addedToday: added.get(today) || 0, difficult,
    learned, learning, newCount,
    accuracy: data.history.length ? Math.round(correct / data.history.length * 100) : 0,
    streak, todayReviews: reviews.get(today) || 0, todayGood, todayHard, todayAgain,
    reviewGoal: data.reviewGoal,
    weekly: points(7, 0, now, reviews, added),
    previousWeekly: points(7, 7, now, reviews, added),
    monthly: points(30, 0, now, reviews, added),
    heatmap: points(84, 0, now, reviews, added)
      .map((point) => Math.min(4, Math.ceil((point.reviews + point.learned) / 5))),
    difficultEntryIds: difficultEntries.map((entry) => entry.id),
    cefr: ["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => ({
      label: level, value: data.entries.filter((entry) => entry.cefr_level === level).length,
    })),
    sources: sourcePercent,
    types: distribution(data.entries.map((entry) => entry.entry_type), typeLabels),
    difficultCategories: distribution(difficultEntries.map((entry) => entry.entry_type), typeLabels),
  };
}

export async function getAnalytics(): Promise<Analytics> {
  const [user, profile] = await Promise.all([requireUser(), getProfile()]);
  const client = await createClient();
  const entries: EntryMetric[] = [], history: HistoryMetric[] = [], cards: CardMetric[] = [];
  const states: StateMetric[] = [], sources: SourceMetric[] = [], mistakes: MistakeMetric[] = [];
  const size = 500;
  for (let offset = 0; ; offset += size) {
    const result = await client.from("entries")
      .select("id,created_at,entry_type,cefr_level,is_difficult,is_mastered,learning_status")
      .eq("user_id", user.id).is("deleted_at", null).range(offset, offset + size - 1);
    if (result.error) throw new Error("İstatistikler yüklenemedi.");
    entries.push(...(result.data || []));
    if (!result.data || result.data.length < size) break;
  }
  for (let offset = 0; ; offset += size) {
    const result = await client.from("review_history")
      .select("flashcard_id,reviewed_at,rating").eq("user_id", user.id)
      .range(offset, offset + size - 1);
    if (result.error) throw new Error("Tekrar geçmişi yüklenemedi.");
    history.push(...(result.data || []));
    if (!result.data || result.data.length < size) break;
  }
  for (let offset = 0; ; offset += size) {
    const result = await client.from("flashcards")
      .select("id,entry_id,is_enabled").eq("user_id", user.id)
      .range(offset, offset + size - 1);
    if (result.error) throw new Error("Kart istatistikleri yüklenemedi.");
    cards.push(...(result.data || []));
    if (!result.data || result.data.length < size) break;
  }
  for (let offset = 0; ; offset += size) {
    const result = await client.from("review_state")
      .select("flashcard_id,state,review_count").eq("user_id", user.id)
      .range(offset, offset + size - 1);
    if (result.error) throw new Error("Tekrar durumu yüklenemedi.");
    states.push(...(result.data || []));
    if (!result.data || result.data.length < size) break;
  }
  for (let offset = 0; ; offset += size) {
    const result = await client.from("entry_sources").select("entry_id,source_type")
      .range(offset, offset + size - 1);
    if (result.error) throw new Error("Kaynak istatistikleri yüklenemedi.");
    sources.push(...(result.data || []));
    if (!result.data || result.data.length < size) break;
  }
  for (let offset = 0; ; offset += size) {
    const result = await client.from("mistakes").select("entry_id,resolved")
      .eq("user_id", user.id).range(offset, offset + size - 1);
    if (result.error) throw new Error("Hata istatistikleri yüklenemedi.");
    mistakes.push(...(result.data || []));
    if (!result.data || result.data.length < size) break;
  }
  return calculateAnalytics({ entries, history, cards, states, sources,
    mistakes, reviewGoal: profile.daily_review_goal });
}
