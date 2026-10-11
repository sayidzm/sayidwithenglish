import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import type { VocabularyInput } from "@/lib/vocabulary/types";

export const defaultCardTypes = [
  "en_to_tr", "tr_to_en", "meaning", "cloze",
  "sentence_completion", "translation", "production",
] as const;
export type CardType = typeof defaultCardTypes[number] | "listening";

type CardDefinition = { card_type: CardType; front_data: Json; back_data: Json };

function cloze(sentence: string, expression: string): string | null {
  const pos = sentence.toLocaleLowerCase("en").indexOf(expression.toLocaleLowerCase("en"));
  if (pos < 0) return null;
  return `${sentence.slice(0, pos)}_____${sentence.slice(pos + expression.length)}`;
}

export function buildCardDefinitions(input: VocabularyInput): CardDefinition[] {
  const meaning = input.meanings[0];
  if (!meaning) return [];
  const example = input.examples[0];
  const cards: CardDefinition[] = [
    { card_type: "en_to_tr", front_data: { expression: input.expression },
      back_data: { meanings: input.meanings } },
    { card_type: "tr_to_en", front_data: { meaning },
      back_data: { expression: input.expression } },
  ];
  if (input.englishExplanation.trim()) cards.push({
    card_type: "meaning", front_data: { definition: input.englishExplanation },
    back_data: { expression: input.expression, meanings: input.meanings },
  });
  if (example?.english && example?.turkish) {
    const blanked = cloze(example.english, input.expression);
    if (blanked) {
      cards.push({ card_type: "cloze", front_data: { sentence: blanked },
        back_data: { answer: input.expression, sentence: example.english } });
      cards.push({ card_type: "sentence_completion", front_data: { sentence: blanked },
        back_data: { answer: input.expression, sentence: example.english } });
    }
    cards.push({ card_type: "translation", front_data: { sentence: example.turkish },
      back_data: { answer: example.english } });
  }
  cards.push({ card_type: "production", front_data: { expression: input.expression,
    prompt: "Bu ifadeyle bir İngilizce cümle kur." },
  back_data: { example: example?.english || "", meaning } });
  // Listening requires genuine audio/TTS and is intentionally not fabricated.
  return cards;
}

export async function createEntryFlashcards(entryId: string, userId: string, input: VocabularyInput) {
  const client = await createClient();
  const { data: preferences, error: preferenceError } = await client.from("learning_preferences")
    .select("enabled_card_types").eq("user_id", userId).maybeSingle();
  if (preferenceError) throw new Error("Kart tercihleri okunamadı.");
  const enabled = new Set(preferences?.enabled_card_types || [...defaultCardTypes]);
  const cards = buildCardDefinitions(input).filter((card) => enabled.has(card.card_type));
  if (!cards.length) return;
  const { data, error } = await client.from("flashcards")
    .upsert(cards.map((card) => ({ ...card, entry_id: entryId, user_id: userId })),
      { onConflict: "entry_id,card_type", ignoreDuplicates: true })
    .select("id");
  if (error) throw new Error("Flashcard oluşturulamadı.");
  if (data?.length) {
    const states = await client.from("review_state")
      .upsert(data.map((card) => ({ flashcard_id: card.id, user_id: userId })),
        { onConflict: "flashcard_id", ignoreDuplicates: true });
    if (states.error) throw new Error("Tekrar durumu oluşturulamadı.");
  }
}
