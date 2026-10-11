import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EntryTypeBadge,
  LevelBadge,
} from "@/components/vocabulary/entry-badges";
import { Pronunciation } from "@/components/vocabulary/entry-detail-drawer";
import type { CSSProperties } from "react";
import type { Entry } from "@/lib/mock-data";
import s from "@/components/workspace/workspace.module.css";

export const reviewRatings = [
  { label: "Tekrar", schedule: "< 1 dakika", color: "danger", key: "1" },
  { label: "Zor", schedule: "6 dakika", color: "warning", key: "2" },
  { label: "İyi", schedule: "1 gün", color: "primary", key: "3" },
  { label: "Kolay", schedule: "4 gün", color: "success", key: "4" },
] as const;
export function Flashcard({
  entry,
  revealed,
  onReveal,
}: {
  entry: Entry;
  revealed: boolean;
  onReveal: () => void;
}) {
  return (
    <article
      className={s.flashcard}
      aria-label={revealed ? "Flashcard arka yüz" : "Flashcard ön yüz"}
    >
      <div className={s.wrap}>
        <EntryTypeBadge type={entry.type} />
        <LevelBadge level={entry.level} />
      </div>
      <h2 lang="en">{entry.expression}</h2>
      {revealed ? (
        <>
          <p className={s.cardMeaning}>{entry.meanings.join(" · ")}</p>
          <div className={s.cardExample}>
            <p lang="en">{entry.examples[0].english}</p>
            <p style={{ marginTop: 8 }}>{entry.examples[0].turkish}</p>
          </div>
        </>
      ) : (
        <>
          <Pronunciation ipa={entry.ipa} />
          <p className={s.caption} style={{ marginTop: 16 }}>
            Bu ifadenin anlamını hatırlıyor musun?
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
export function ReviewControls({
  revealed,
  onRate,
}: {
  revealed: boolean;
  onRate: (rating: string) => void;
}) {
  return (
    <div className={s.ratings}>
      {reviewRatings.map((rating) => (
        <div
          className={s.rating}
          key={rating.label}
          style={
            {
              "--rating-color": `var(--${rating.color})`,
              "--rating-soft": `var(--${rating.color}-soft)`,
            } as CSSProperties
          }
        >
          <Button disabled={!revealed} onClick={() => onRate(rating.label)}>
            <span>{rating.label}</span>
            <span className={s.caption}>{rating.key}</span>
          </Button>
          <small>{rating.schedule}</small>
        </div>
      ))}
    </div>
  );
}
