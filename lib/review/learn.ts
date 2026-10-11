import "server-only";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getReviewQueue } from "./queries";

export type PracticeMode = "quiz" | "cloze" | "translation" | "writing";
export type LearnExercise = {
  cardId: string;
  mode: PracticeMode;
  expression: string;
  question: string;
  answer: string;
  options: string[];
  example: string;
};
export type LearnData = {
  exercises: LearnExercise[];
  completedToday: number;
  goal: number;
  level: string;
};

function object(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : {};
}
function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export async function getLearnData(): Promise<LearnData> {
  const user = await requireUser();
  const [queue, client] = await Promise.all([getReviewQueue(), createClient()]);
  const { data: cards, error } = await client.from("flashcards")
    .select("id,entry_id,card_type,front_data,back_data")
    .eq("user_id", user.id).eq("is_enabled", true)
    .in("card_type", ["en_to_tr", "cloze", "translation", "production"])
    .order("created_at", { ascending: false }).limit(120);
  if (error) throw new Error("Alıştırmalar yüklenemedi.");
  const entryIds = [...new Set((cards || []).map((card) => card.entry_id))];
  const { data: entries, error: entriesError } = entryIds.length
    ? await client.from("entries")
      .select("id,expression,cefr_level,entry_meanings(meaning_tr,meaning_order),entry_examples(sentence_en,example_order)")
      .eq("user_id", user.id).is("deleted_at", null).in("id", entryIds)
    : { data: [], error: null };
  if (entriesError) throw new Error("Alıştırma içerikleri yüklenemedi.");
  const entryMap = new Map((entries || []).map((entry) => [entry.id, entry]));
  const meaningPool = [...new Set((entries || []).flatMap((entry) =>
    entry.entry_meanings.map((meaning) => meaning.meaning_tr)))];
  const exercises: LearnExercise[] = [];
  for (const card of cards || []) {
    const entry = entryMap.get(card.entry_id);
    if (!entry) continue;
    const meaning = [...entry.entry_meanings]
      .sort((a, b) => a.meaning_order - b.meaning_order)[0]?.meaning_tr || "";
    const example = [...entry.entry_examples]
      .sort((a, b) => a.example_order - b.example_order)[0]?.sentence_en || "";
    const front = object(card.front_data);
    const back = object(card.back_data);
    if (card.card_type === "en_to_tr" && meaning) {
      const distractors = meaningPool.filter((item) => item !== meaning).slice(0, 3);
      const options = [meaning, ...distractors].sort((a, b) =>
        (a.length + card.id.charCodeAt(0)) % 7 - (b.length + card.id.charCodeAt(1)) % 7);
      exercises.push({ cardId: card.id, mode: "quiz", expression: entry.expression,
        question: `“${entry.expression}” ne anlama gelir?`, answer: meaning, options, example });
    } else if (card.card_type === "cloze" && text(front.sentence) && text(back.answer)) {
      exercises.push({ cardId: card.id, mode: "cloze", expression: entry.expression,
        question: text(front.sentence), answer: text(back.answer), options: [], example });
    } else if (card.card_type === "translation" && text(front.sentence) && text(back.answer)) {
      exercises.push({ cardId: card.id, mode: "translation", expression: entry.expression,
        question: `İngilizceye çevir: ${text(front.sentence)}`, answer: text(back.answer),
        options: [], example });
    } else if (card.card_type === "production") {
      exercises.push({ cardId: card.id, mode: "writing", expression: entry.expression,
        question: text(front.prompt) || `“${entry.expression}” ile bir İngilizce cümle kur.`,
        answer: text(back.example) || example, options: [], example });
    }
  }
  return { exercises, completedToday: queue.completedToday, goal: queue.goal,
    level: (entries || [])[0]?.cefr_level || "B1" };
}
