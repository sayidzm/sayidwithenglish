"use client";

import { ArrowLeft, Check, Maximize2, Minimize2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Flashcard, ReviewControls, reviewRatings } from "@/components/learning/flashcard";
import { rateFlashcard } from "@/lib/review/actions";
import type { ReviewQueue } from "@/lib/review/queries";
import type { ReviewRating } from "@/lib/review/scheduler";
import { usePrototype } from "./prototype-provider";
import { cn } from "@/lib/cn";
import s from "./workspace.module.css";

export function Review({ initialQueue }: { initialQueue: ReviewQueue }) {
  const { settings, focusMode: focus, setFocusMode: setFocus } = usePrototype();
  const [cards, setCards] = useState(initialQueue.cards);
  const [completed, setCompleted] = useState(initialQueue.completedToday);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [openedAt, setOpenedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastRating, setLastRating] = useState("");
  const goal = Math.max(1, initialQueue.goal);
  const finished = completed >= goal;
  const card = cards[0];
  const rate = useCallback(async (rating: ReviewRating) => {
    if (!revealed || !card || busy) return;
    setBusy(true);
    try {
      const result = await rateFlashcard({ cardId: card.id, rating, sessionId,
        responseTimeMs: openedAt ? Math.min(600000, Date.now() - openedAt) : undefined });
      if (!result.ok) { setLastRating(result.message); return; }
      setSessionId(result.sessionId);
      setCards((current) => current.slice(1));
      setCompleted((count) => count + 1);
      setRevealed(false);
      setOpenedAt(null);
      setLastRating(`${card.expression}: tekrar kaydedildi. Sonraki tarih ${new Date(result.dueAt).toLocaleDateString("tr-TR")}.`);
    } catch { setLastRating("Tekrar kaydedilemedi. Bağlantını kontrol edip yeniden dene."); }
    finally { setBusy(false); }
  }, [revealed, card, busy, sessionId, openedAt]);
  useEffect(() => {
    function keyboard(e: KeyboardEvent) {
      if (!settings.shortcuts || e.ctrlKey || e.metaKey || e.altKey ||
        (e.target instanceof HTMLElement &&
          (e.target.matches("input, textarea, select, button, a") || e.target.isContentEditable)) ||
        document.querySelector('[role="dialog"]')) return;
      if (e.code === "Space" && card && !revealed) {
        e.preventDefault(); setRevealed(true); setOpenedAt(Date.now());
      }
      const choice = reviewRatings.find((item) => item.key === e.key);
      if (choice && revealed) { e.preventDefault(); void rate(choice.value); }
    }
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  }, [revealed, rate, card, settings.shortcuts]);
  return (
    <>
      <PageHeader title="Tekrar" description="Hatırla, değerlendir, bir adım daha ilerle."
        actions={<Button variant="ghost" size="small" onClick={() => setFocus(!focus)} aria-pressed={focus}>
          {focus ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          {focus ? "Odak modundan çık" : "Odak modu"}
        </Button>} />
      <div className={cn(s.review, focus && s.focus)}>
        <div className={s.reviewProgress}>
          <ButtonLink href="/learn" variant="ghost" size="small" aria-label="Öğrenme merkezine dön">
            <ArrowLeft size={16} />
          </ButtonLink>
          <span>Günlük tekrar</span>
          <div className={s.progressTrack} role="progressbar" aria-label="Tekrar ilerlemesi"
            aria-valuenow={Math.min(completed, goal)} aria-valuemin={0} aria-valuemax={goal}>
            <div className={s.progressFill} style={{ width: `${Math.min(100, completed / goal * 100)}%` }} />
          </div>
          <strong>{completed} / {goal}</strong>
        </div>
        {initialQueue.error ? <div className={s.flashcard} role="alert">{initialQueue.error}</div> :
          finished ? <div className={s.flashcard}>
            <span className={s.avatar}><Check size={20} /></span>
            <h2>Bugünkü tekrarlar tamam!</h2>
            <p className={s.muted}>{completed} kartı değerlendirdin.</p>
          </div> : card ? <>
            <Flashcard card={card} revealed={revealed}
              onReveal={() => { setRevealed(true); setOpenedAt(Date.now()); }} />
            <ReviewControls revealed={revealed} busy={busy} schedule={card.schedule} onRate={rate} />
          </> : <div className={s.flashcard}>
            <span className={s.avatar}><Check size={20} /></span>
            <h2>Şu anda tekrar bekleyen kart yok</h2>
            <p className={s.muted}>Yeni ifadeler ekleyebilir veya bir sonraki tekrar saatini bekleyebilirsin.</p>
            <ButtonLink href="/add" variant="secondary" size="small" style={{ marginTop: 20 }}>İfade ekle</ButtonLink>
          </div>}
        <p className={s.caption} role="status" style={{ textAlign: "center", marginTop: 16, minHeight: 18 }}>
          {lastRating || (card ? "Anlamı gösterdikten sonra hatırlama düzeyini seç." : "")}
        </p>
        <div className={s.reviewHints}>
          <span><kbd className={s.kbd}>Space</kbd>Anlamı göster</span>
          <span><kbd className={s.kbd}>1–4</kbd>Değerlendir</span>
          <span><RotateCcw size={12} style={{ display: "inline", marginRight: 4 }} />
            {initialQueue.newRemaining} yeni kart hakkı</span>
        </div>
      </div>
    </>
  );
}
