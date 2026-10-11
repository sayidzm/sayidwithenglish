import { createEmptyCard, fsrs, Rating, State, type Card } from "ts-fsrs";
import type { Tables } from "@/lib/supabase/database.types";

export type ReviewRating = "again" | "hard" | "good" | "easy";
const ratings: Record<ReviewRating, Rating.Again | Rating.Hard | Rating.Good | Rating.Easy> = {
  again: Rating.Again, hard: Rating.Hard, good: Rating.Good, easy: Rating.Easy,
};
const stateToFsrs: Record<string, State> = {
  new: State.New, learning: State.Learning, review: State.Review,
  relearning: State.Relearning,
};
const fsrsToState: Record<State, string> = {
  [State.New]: "new", [State.Learning]: "learning",
  [State.Review]: "review", [State.Relearning]: "relearning",
};
const scheduler = fsrs({ enable_fuzz: false });

export function toFsrsCard(row: Tables<"review_state">): Card {
  if (row.review_count === 0) return createEmptyCard(new Date(row.due_at));
  return {
    due: new Date(row.due_at), stability: row.stability,
    difficulty: row.difficulty, elapsed_days: row.elapsed_days,
    scheduled_days: row.scheduled_days, learning_steps: row.learning_steps,
    reps: row.review_count, lapses: row.lapse_count,
    state: stateToFsrs[row.state] ?? State.New,
    last_review: row.last_reviewed_at ? new Date(row.last_reviewed_at) : undefined,
  };
}

export function scheduleReview(row: Tables<"review_state">, rating: ReviewRating, now = new Date()) {
  const result = scheduler.next(toFsrsCard(row), now, ratings[rating]);
  const card = result.card;
  return {
    dueAt: card.due.toISOString(), stability: card.stability,
    difficulty: card.difficulty, scheduledDays: card.scheduled_days,
    elapsedDays: card.elapsed_days, learningSteps: card.learning_steps,
    state: fsrsToState[card.state], lapseCount: card.lapses,
  };
}

export function previewSchedule(row: Tables<"review_state">, now = new Date()) {
  const card = toFsrsCard(row);
  return Object.fromEntries((Object.keys(ratings) as ReviewRating[]).map((rating) => {
    const due = scheduler.next(card, now, ratings[rating]).card.due.getTime();
    const minutes = Math.max(1, Math.round((due - now.getTime()) / 60_000));
    return [rating, minutes < 60 ? `${minutes} dk` : minutes < 1440
      ? `${Math.round(minutes / 60)} sa` : `${Math.round(minutes / 1440)} gün`];
  })) as Record<ReviewRating, string>;
}
