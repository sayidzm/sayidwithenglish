import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EntryTypeBadge, LevelBadge } from "@/components/vocabulary/entry-badges";
import { Pronunciation } from "@/components/vocabulary/entry-detail-drawer";
import type { CSSProperties } from "react";
import type { ReviewCard } from "@/lib/review/queries";
import type { ReviewRating } from "@/lib/review/scheduler";
import type { EntryType, Level } from "@/lib/mock-data";
import s from "@/components/workspace/workspace.module.css";

export const reviewRatings = [
  { label: "Tekrar", value: "again", color: "danger", key: "1" },
  { label: "Zor", value: "hard", color: "warning", key: "2" },
  { label: "İyi", value: "good", color: "primary", key: "3" },
  { label: "Kolay", value: "easy", color: "success", key: "4" },
] as const;

function value(data: ReviewCard["front"], key: string): string {
  return typeof data === "object" && data !== null && !Array.isArray(data) &&
    typeof data[key] === "string" ? data[key] : "";
}
const typeNames: Record<string, EntryType> = {
  word: "Word", phrase: "Phrase", phrasal_verb: "Phrasal Verb",
  sentence: "Sentence", idiom: "Phrase", collocation: "Phrase",
  grammar_pattern: "Phrase", slang: "Phrase",
};

export function Flashcard({ card, revealed, onReveal }: {
  card: ReviewCard; revealed: boolean; onReveal: () => void;
}) {
  const prompt = value(card.front, "expression") || value(card.front, "meaning") ||
    value(card.front, "definition") || value(card.front, "sentence") ||
    value(card.front, "prompt") || card.expression;
  const back = value(card.back, "expression") || value(card.back, "answer") ||
    value(card.back, "example") || card.meanings.join(" · ");
  return (
    <article className={s.flashcard}
      aria-label={revealed ? "Flashcard arka yüz" : "Flashcard ön yüz"}>
      <div className={s.wrap}>
        <EntryTypeBadge type={typeNames[card.type] || "Phrase"} />
        <LevelBadge level={card.level as Level} />
      </div>
      <h2 lang={card.cardType === "tr_to_en" || card.cardType === "translation" ? "tr" : "en"}>
        {prompt}
      </h2>
      {revealed ? (
        <>
          <p className={s.cardMeaning}>{back}</p>
          {card.example && <div className={s.cardExample}>
            <p lang="en">{card.example.english}</p>
            <p style={{ marginTop: 8 }}>{card.example.turkish}</p>
          </div>}
        </>
      ) : (
        <>
          {card.cardType === "en_to_tr" && <Pronunciation ipa={card.ipa} />}
          <p className={s.caption} style={{ marginTop: 16 }}>
            Bu kartın yanıtını hatırlıyor musun?
          </p>
          <Button variant="secondary" onClick={onReveal} className={s.reveal}>
            <RotateCcw size={14} />
            Anlamı göster<kbd className={s.kbd}>Space</kbd>
          </Button>
        </>
      )}
    </article>
  );
}

export function ReviewControls({ revealed, busy, schedule, onRate }: {
  revealed: boolean; busy: boolean; schedule: ReviewCard["schedule"];
  onRate: (rating: ReviewRating) => void;
}) {
  return (
    <div className={s.ratings}>
      {reviewRatings.map((rating) => (
        <div className={s.rating} key={rating.value}
          style={{ "--rating-color": `var(--${rating.color})`,
            "--rating-soft": `var(--${rating.color}-soft)` } as CSSProperties}>
          <Button disabled={!revealed || busy} onClick={() => onRate(rating.value)}>
            <span>{rating.label}</span><span className={s.caption}>{rating.key}</span>
          </Button>
          <small>{schedule[rating.value]}</small>
        </div>
      ))}
    </div>
  );
}
