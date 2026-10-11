"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { scheduleReview, type ReviewRating } from "./scheduler";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RatingResult =
  | { ok: true; sessionId: string; dueAt: string }
  | { ok: false; message: string };

export async function rateFlashcard(input: unknown): Promise<RatingResult> {
  const user = await requireUser();
  if (typeof input !== "object" || input === null || Array.isArray(input))
    return { ok: false, message: "Geçersiz tekrar isteği." };
  const value = input as Record<string, unknown>;
  if (typeof value.cardId !== "string" || !uuid.test(value.cardId) ||
      !["again", "hard", "good", "easy"].includes(String(value.rating)) ||
      (value.sessionId !== null && value.sessionId !== undefined &&
        (typeof value.sessionId !== "string" || !uuid.test(value.sessionId))) ||
      (value.responseTimeMs !== undefined &&
        (typeof value.responseTimeMs !== "number" || value.responseTimeMs < 0 ||
          value.responseTimeMs > 600000)) ||
      (value.userAnswer !== undefined &&
        (typeof value.userAnswer !== "string" || value.userAnswer.length > 3000)))
    return { ok: false, message: "Geçersiz tekrar isteği." };
  const client = await createClient();
  const { data: state, error } = await client.from("review_state").select("*")
    .eq("flashcard_id", value.cardId).eq("user_id", user.id).maybeSingle();
  if (error || !state) return { ok: false, message: "Kart bulunamadı. Sayfayı yenile." };
  const { data: card } = await client.from("flashcards").select("id,entry_id,is_enabled,back_data")
    .eq("id", value.cardId).eq("user_id", user.id).maybeSingle();
  if (!card?.is_enabled) return { ok: false, message: "Kart artık kullanılamıyor." };
  const now = new Date();
  const next = scheduleReview(state, value.rating as ReviewRating, now);
  let sessionId = typeof value.sessionId === "string" ? value.sessionId : null;
  if (!sessionId) {
    const { data: session, error: sessionError } = await client.from("study_sessions")
      .insert({ session_type: "flashcard" }).select("id").single();
    if (sessionError || !session) return { ok: false, message: "Çalışma oturumu başlatılamadı." };
    sessionId = session.id;
  }
  const correctAnswer = typeof card.back_data === "object" && card.back_data !== null &&
    !Array.isArray(card.back_data) ? JSON.stringify(card.back_data).slice(0, 3000) : null;
  const { error: reviewError } = await client.rpc("commit_review", {
    p_flashcard_id: card.id,
    p_rating: value.rating as ReviewRating,
    p_expected_count: state.review_count,
    p_due_at: next.dueAt,
    p_stability: next.stability,
    p_difficulty: next.difficulty,
    p_scheduled_days: next.scheduledDays,
    p_elapsed_days: next.elapsedDays,
    p_learning_steps: next.learningSteps,
    p_state: next.state,
    p_lapse_count: next.lapseCount,
    p_response_time_ms: typeof value.responseTimeMs === "number" ? Math.round(value.responseTimeMs) : null,
    p_session_id: sessionId,
    p_user_answer: typeof value.userAnswer === "string" ? value.userAnswer : null,
    p_correct_answer: correctAnswer,
  });
  if (reviewError) return { ok: false, message: reviewError.code === "40001"
    ? "Bu kart başka oturumda değerlendirildi. Sayfayı yenile."
    : "Tekrar kaydedilemedi. Tekrar dene." };
  for (const path of ["/review", "/learn", "/dashboard", "/statistics", "/library", "/tutor"])
    revalidatePath(path);
  return { ok: true, sessionId, dueAt: next.dueAt };
}
