"use server";

import { requireUser } from "@/lib/auth/session";
import { AiError, generateJson } from "@/lib/ai/google";
import { tutorSystemPrompt } from "@/lib/ai/prompts";
import { tutorResponseSchema, validateTutorOutput, type TutorOutput } from "@/lib/ai/schemas";
import { getTutorContext } from "./context";

export type TutorTurn = { role: "user" | "assistant"; text: string };
export type TutorResult = { ok: true; output: TutorOutput } | { ok: false; message: string };

export async function askTutor(message: unknown, history: unknown): Promise<TutorResult> {
  const user = await requireUser();
  if (typeof message !== "string" || !message.trim() || message.length > 2000 ||
      !Array.isArray(history) || history.length > 8 ||
      !history.every((item: unknown) => typeof item === "object" && item !== null &&
        "role" in item && (item.role === "user" || item.role === "assistant") &&
        "text" in item && typeof item.text === "string" && item.text.length <= 2000))
    return { ok: false, message: "Mesajını kontrol et ve tekrar dene." };
  const context = await getTutorContext();
  const prompt = JSON.stringify({
    learner_level: context.level,
    recent_vocabulary: context.recent.slice(0, 12).map((item) =>
      ({ expression: item.expression, meaning_tr: item.meaning })),
    difficult_vocabulary: context.difficult.slice(0, 6).map((item) => item.expression),
    mistakes: context.mistakes.slice(0, 6),
    active_deck: context.activeDeck?.name || null,
    recently_reviewed: context.recentlyReviewed.slice(0, 8),
    conversation: (history as TutorTurn[]).slice(-6),
    user_message: message.trim(),
  });
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const result = await generateJson(user.id, "tutor", tutorSystemPrompt, prompt, tutorResponseSchema);
      if (validateTutorOutput(result)) return { ok: true, output: result };
    } catch (error) {
      if (error instanceof AiError && error.code !== "invalid_response") {
        if (error.code === "rate_limit")
          return { ok: false, message: "AI kullanım sınırına ulaşıldı. Biraz sonra tekrar dene." };
        if (error.code === "invalid_key")
          return { ok: false, message: "AI yapılandırması geçersiz." };
        if (error.code === "forbidden")
          return { ok: false, message: "AI erişimi reddedildi." };
        if (error.code === "model_not_found")
          return { ok: false, message: "Seçili AI modeli kullanılamıyor." };
        if (error.code === "service_unavailable")
          return { ok: false, message: "AI servisi geçici bir sorun yaşıyor." };
        return { ok: false, message: error.code === "unavailable"
          ? "AI Tutor şu anda kullanılamıyor."
          : "AI Tutor bağlantısı kurulamadı. Mesajın korundu." };
      }
    }
  }
  return { ok: false, message: "AI yanıtı doğrulanamadı. Mesajını tekrar gönderebilirsin." };
}
