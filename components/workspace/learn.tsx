"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Headphones,
  Languages,
  Layers,
  ListChecks,
  PencilLine,
  TextCursorInput,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ChartCard } from "@/components/data/visualizations";
import {
  practiceExercises,
  practiceModes,
  type PracticeMode,
} from "@/lib/mock-data";
import { cn } from "@/lib/cn";
import { usePrototype } from "./prototype-provider";
import s from "./workspace.module.css";

const icons = {
  cards: Layers,
  quiz: ListChecks,
  cloze: TextCursorInput,
  listening: Headphones,
  translation: Languages,
  writing: PencilLine,
};
export function Learn() {
  const { settings, reviewed } = usePrototype();
  const [mode, setMode] = useState<PracticeMode | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  function start(value: PracticeMode) {
    setMode(value);
    setAnswer("");
    setFeedback("");
  }
  function check() {
    if (mode === "writing") {
      setFeedback(
        `Cümlen kaydedildi. Örnekle karşılaştır: ${practiceExercises.writing.example} (Bu alıştırma otomatik dil değerlendirmesi yapmaz.)`,
      );
      return;
    }
    const expected =
      mode === "cloze"
        ? practiceExercises.cloze.answer
        : practiceExercises.translation.answer;
    const normalize = (value: string) =>
      value.toLowerCase().replace(/[.!?]/g, "").trim();
    setFeedback(
      normalize(answer) === normalize(expected)
        ? "Doğru! Bu ifadeyi bağlam içinde hatırladın."
        : `Bir kez daha gözden geçir. Örnek yanıt: ${expected}`,
    );
  }
  return (
    <>
      <PageHeader
        title="Öğren"
        description="Kendi koleksiyonunla pratik yap. Bugün nasıl çalışmak istersin?"
        actions={
          <span className={s.caption}>
            <BookOpen size={14} style={{ display: "inline", marginRight: 8 }} />
            Günlük İngilizce · {settings.currentLevel}
          </span>
        }
      />
      <div className={s.stack}>
        <div className={s.continue}>
          <div>
            <h2>Kaldığın yerden devam et</h2>
            <p>
              Bugünkü tekrarlarında {reviewed} / {settings.reviewGoal} kartı
              tamamladın.
            </p>
          </div>
          <ButtonLink href="/review" size="small">
            Tekrara devam
            <ArrowRight size={14} />
          </ButtonLink>
        </div>
        {mode && mode !== "flashcards" && mode !== "listening" ? (
          <ChartCard
            title={practiceModes.find((m) => m.id === mode)!.title}
            subtitle="Günlük İngilizce · Örnek alıştırma"
            className={s.practice}
            action={
              <Button
                variant="ghost"
                size="small"
                onClick={() => setMode(null)}
              >
                <ArrowLeft size={14} />
                Modlara dön
              </Button>
            }
          >
            <p className={s.practiceQuestion}>
              {practiceExercises[mode].question}
            </p>
            {mode === "quiz" ? (
              <div className={s.practiceOptions}>
                {practiceExercises.quiz.options.map((option) => (
                  <Button
                    key={option}
                    variant={answer === option ? "primary" : "secondary"}
                    onClick={() => {
                      setAnswer(option);
                      setFeedback(
                        option === practiceExercises.quiz.correct
                          ? "Doğru! ‘Figure out’, düşünerek anlamak veya çözmek demek."
                          : "Tekrar dene. Bir sorunu düşünerek çözmek anlamına gelir.",
                      );
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  check();
                }}
              >
                <label className={s.field}>
                  <span>Yanıtın</span>
                  {mode === "writing" ? (
                    <Textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="İngilizce cümleni yaz..."
                      style={{ minHeight: 120 }}
                    />
                  ) : (
                    <Input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="İngilizce yanıtını yaz..."
                    />
                  )}
                </label>
                <Button
                  size="small"
                  type="submit"
                  disabled={!answer.trim()}
                  style={{ marginTop: 16 }}
                >
                  <Check size={14} />
                  {mode === "writing"
                    ? "Örnekle karşılaştır"
                    : "Yanıtı kontrol et"}
                </Button>
              </form>
            )}
            {feedback && (
              <p className={s.feedback} role="status">
                {feedback}
              </p>
            )}
          </ChartCard>
        ) : (
          <div className={s.learningModes}>
            {practiceModes.map((item) => {
              const Icon = icons[item.icon];
              return (
                <section key={item.id} className={cn(s.panel, s.modeCard)}>
                  <span className={s.avatar}>
                    <Icon size={18} />
                  </span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <div className={s.spread}>
                    <span className={s.caption}>{item.count}</span>
                    {item.id === "flashcards" ? (
                      <ButtonLink
                        variant="secondary"
                        size="small"
                        href="/review"
                      >
                        Başla
                        <ArrowRight size={14} />
                      </ButtonLink>
                    ) : (
                      <Button
                        variant="secondary"
                        size="small"
                        disabled={item.id === "listening"}
                        onClick={() => start(item.id)}
                      >
                        {item.id === "listening" ? "Yakında" : "Başla"}
                        {item.id !== "listening" && <ArrowRight size={14} />}
                      </Button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
        <p className={s.caption}>
          Yeni ifadeleri yalnızca tanımakla kalma; onları cümlelerinin bir
          parçası yap.
        </p>
      </div>
    </>
  );
}
