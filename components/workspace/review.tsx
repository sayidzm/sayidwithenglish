"use client";

import {
  ArrowLeft,
  Check,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Flashcard,
  ReviewControls,
  reviewRatings,
} from "@/components/learning/flashcard";
import { usePrototype } from "./prototype-provider";
import { cn } from "@/lib/cn";
import s from "./workspace.module.css";

export function Review() {
  const {
    entries,
    settings,
    reviewed,
    setReviewed,
    focusMode: focus,
    setFocusMode: setFocus,
  } = usePrototype();
  const completed = reviewed;
  const [revealed, setRevealed] = useState(false);
  const [lastRating, setLastRating] = useState("");
  const goal = Math.max(1, settings.reviewGoal);
  const finished = completed >= goal;
  const entry = entries[Math.max(0, completed - 12) % entries.length];
  const rate = useCallback(
    (rating: string) => {
      if (!revealed || finished) return;
      setReviewed(completed + 1);
      setRevealed(false);
      setLastRating(`${entry.expression}: ${rating} olarak değerlendirildi.`);
    },
    [revealed, finished, entry.expression, setReviewed, completed],
  );
  useEffect(() => {
    function keyboard(e: KeyboardEvent) {
      if (
        !settings.shortcuts ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        (e.target instanceof HTMLElement &&
          (e.target.matches("input, textarea, select, button, a") ||
            e.target.isContentEditable)) ||
        document.querySelector('[role="dialog"]')
      )
        return;
      if (e.code === "Space" && !finished) {
        e.preventDefault();
        setRevealed(true);
      }
      const rating = reviewRatings.find((r) => r.key === e.key);
      if (rating && revealed) {
        e.preventDefault();
        rate(rating.label);
      }
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [revealed, rate, finished, settings.shortcuts]);
  return (
    <>
      <PageHeader
        title="Tekrar"
        description="Hatırla, değerlendir, bir adım daha ilerle."
        actions={
          <Button
            variant="ghost"
            size="small"
            onClick={() => setFocus(!focus)}
            aria-pressed={focus}
          >
            {focus ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            {focus ? "Odak modundan çık" : "Odak modu"}
          </Button>
        }
      />
      <div className={cn(s.review, focus && s.focus)}>
        <div className={s.reviewProgress}>
          <ButtonLink
            href="/learn"
            variant="ghost"
            size="small"
            aria-label="Öğrenme merkezine dön"
          >
            <ArrowLeft size={16} />
          </ButtonLink>
          <span>Günlük İngilizce</span>
          <div
            className={s.progressTrack}
            role="progressbar"
            aria-label="Tekrar ilerlemesi"
            aria-valuenow={Math.min(completed, goal)}
            aria-valuemin={0}
            aria-valuemax={goal}
          >
            <div
              className={s.progressFill}
              style={{ width: `${Math.min(100, (completed / goal) * 100)}%` }}
            />
          </div>
          <strong>
            {completed} / {goal}
          </strong>
        </div>
        {finished ? (
          <div className={s.flashcard}>
            <span className={s.avatar}>
              <Check size={20} />
            </span>
            <h2>Bugünkü tekrarlar tamam!</h2>
            <p className={s.muted}>{goal} kartla İngilizcene yatırım yaptın.</p>
            <Button
              variant="secondary"
              style={{ marginTop: 24 }}
              onClick={() => {
                setReviewed(Math.min(12, goal - 1));
                setLastRating("");
              }}
            >
              Örnek oturumu yeniden başlat
            </Button>
          </div>
        ) : (
          <>
            <Flashcard
              entry={entry}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
            />
            <ReviewControls revealed={revealed} onRate={rate} />
          </>
        )}
        <p
          className={s.caption}
          role="status"
          style={{ textAlign: "center", marginTop: 16, minHeight: 18 }}
        >
          {lastRating || "Anlamı gösterdikten sonra hatırlama düzeyini seç."}
        </p>
        <div className={s.reviewHints}>
          <span>
            <kbd className={s.kbd}>Space</kbd>Anlamı göster
          </span>
          <span>
            <kbd className={s.kbd}>1–4</kbd>Değerlendir
          </span>
          <span>
            <RotateCcw
              size={12}
              style={{ display: "inline", marginRight: 4 }}
            />
            Örnek tekrar oturumu
          </span>
        </div>
      </div>
    </>
  );
}
