"use client";

import { ArrowLeft, ArrowRight, BookOpen, Check, Headphones, Languages, Layers, ListChecks, PencilLine, TextCursorInput } from "lucide-react";
import { useState, useTransition } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { ChartCard } from "@/components/data/visualizations";
import { rateFlashcard } from "@/lib/review/actions";
import type { LearnData, PracticeMode } from "@/lib/review/learn";
import { cn } from "@/lib/cn";
import s from "./workspace.module.css";

const modes = [
  { id: "flashcards", title: "Flashcards", description: "Günlük tekrar sırandaki kartları çalış.", icon: Layers },
  { id: "quiz", title: "Quiz", description: "İfadelerin Türkçe anlamını seç.", icon: ListChecks },
  { id: "cloze", title: "Boşluk doldurma", description: "İfadeyi kayıtlı örnek cümleye yerleştir.", icon: TextCursorInput },
  { id: "listening", title: "Listening", description: "Gerçek ses desteği eklendiğinde açılacak.", icon: Headphones },
  { id: "translation", title: "Translation", description: "Kayıtlı cümlelerini İngilizceye çevir.", icon: Languages },
  { id: "writing", title: "Writing practice", description: "Kendi cümleni örnekle karşılaştır.", icon: PencilLine },
] as const;

function normalize(value: string) {
  return value.toLocaleLowerCase("en").replace(/[.!?,;:'“”‘’]/g, "").replace(/\s+/g, " ").trim();
}

export function Learn({ data }: { data: LearnData }) {
  const [mode, setMode] = useState<PracticeMode | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [pending, startTransition] = useTransition();
  const candidates = data.exercises.filter((item) => item.mode === mode);
  const exercise = candidates[index % candidates.length];

  function start(value: PracticeMode) {
    setMode(value); setIndex(0); setAnswer(""); setFeedback(""); setRevealed(false);
  }
  function next() {
    setIndex((current) => current + 1); setAnswer(""); setFeedback(""); setRevealed(false);
  }
  function grade(correct: boolean, selectedAnswer = answer) {
    if (!exercise || pending) return;
    setRevealed(true);
    startTransition(async () => {
      try {
        const result = await rateFlashcard({ cardId: exercise.cardId,
          rating: correct ? "good" : "again", userAnswer: selectedAnswer.trim() });
        setFeedback(result.ok
          ? correct ? "Doğru! Çalışman kaydedildi." : `Tekrar çalışılacak. Örnek yanıt: ${exercise.answer}`
          : result.message);
      } catch {
        setFeedback("Yanıtın kaydedilemedi. Yeniden deneyebilirsin.");
        setRevealed(false);
      }
    });
  }
  return <>
    <PageHeader title="Öğren" description="Kendi koleksiyonunla pratik yap. Bugün nasıl çalışmak istersin?"
      actions={<span className={s.caption}><BookOpen size={14} style={{ display: "inline", marginRight: 8 }} />{data.level} seviyesi</span>} />
    <div className={s.stack}>
      <div className={s.continue}>
        <div><h2>Kaldığın yerden devam et</h2><p>Bugünkü tekrarlarında {data.completedToday} / {data.goal} kartı tamamladın.</p></div>
        <ButtonLink href="/review" size="small">Tekrara devam <ArrowRight size={14} /></ButtonLink>
      </div>
      {mode ? <ChartCard title={modes.find((item) => item.id === mode)?.title || "Alıştırma"}
        subtitle={exercise ? `${index % candidates.length + 1} / ${candidates.length} · ${exercise.expression}` : "Uygun kart yok"}
        className={s.practice}
        action={<Button variant="ghost" size="small" onClick={() => setMode(null)}><ArrowLeft size={14} /> Modlara dön</Button>}>
        {exercise ? <>
          <p className={s.practiceQuestion}>{exercise.question}</p>
          {mode === "quiz" ? <div className={s.practiceOptions}>
            {exercise.options.map((option) => <Button key={option}
              variant={answer === option ? "primary" : "secondary"} disabled={pending || revealed}
              onClick={() => { setAnswer(option); grade(option === exercise.answer, option); }}>{option}</Button>)}
          </div> : <form onSubmit={(event) => { event.preventDefault();
            if (mode === "writing") { setRevealed(true); setFeedback("Örneği incele, ardından çalışmanı değerlendir."); }
            else grade(normalize(answer) === normalize(exercise.answer)); }}>
            <label className={s.field}><span>Yanıtın</span>
              {mode === "writing" ? <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)}
                placeholder="İngilizce cümleni yaz..." style={{ minHeight: 120 }} disabled={revealed || pending} />
                : <Input value={answer} onChange={(event) => setAnswer(event.target.value)}
                  placeholder="İngilizce yanıtını yaz..." disabled={revealed || pending} />}
            </label>
            {!revealed && <Button size="small" type="submit" disabled={!answer.trim() || pending} style={{ marginTop: 16 }}>
              <Check size={14} />{mode === "writing" ? "Örnekle karşılaştır" : "Yanıtı kontrol et"}</Button>}
          </form>}
          {revealed && mode === "writing" && <div className={s.stack} style={{ marginTop: 16 }}>
            <p className={s.feedback}>Örnek: {exercise.answer || "Bu kart için henüz örnek cümle yok."}</p>
            {feedback === "Örneği incele, ardından çalışmanı değerlendir." && <div className={s.row}>
              <Button size="small" variant="secondary" disabled={pending} onClick={() => grade(false)}>Tekrar çalış</Button>
              <Button size="small" disabled={pending} onClick={() => grade(true)}>Hatırladım</Button>
            </div>}
          </div>}
          {feedback && <p className={s.feedback} role="status">{feedback}</p>}
          {revealed && feedback && feedback !== "Örneği incele, ardından çalışmanı değerlendir." &&
            <Button size="small" variant="secondary" onClick={next}>Sonraki kart <ArrowRight size={14} /></Button>}
        </> : <p className={s.caption}>Bu mod için uygun kayıt bulunamadı. Library’ye örnek ve anlam içeren ifade ekleyebilirsin.</p>}
      </ChartCard> : <div className={s.learningModes}>{modes.map((item) => {
        const Icon = item.icon;
        const available = item.id !== "listening" &&
          (item.id === "flashcards" || data.exercises.some((exercise) => exercise.mode === item.id));
        return <section key={item.id} className={cn(s.panel, s.modeCard)}>
          <span className={s.avatar}><Icon size={18} /></span><h2>{item.title}</h2><p>{item.description}</p>
          <div className={s.spread}><span className={s.caption}>{item.id === "listening" ? "Ses desteği bekleniyor"
            : item.id === "flashcards" ? `${data.goal} günlük hedef`
              : `${data.exercises.filter((exercise) => exercise.mode === item.id).length} alıştırma`}</span>
            {item.id === "flashcards" ? <ButtonLink variant="secondary" size="small" href="/review">Başla <ArrowRight size={14} /></ButtonLink>
              : <Button variant="secondary" size="small" disabled={!available} onClick={() => {
                if (item.id !== "listening") start(item.id);
              }}>{item.id === "listening" ? "Yakında" : "Başla"}{available && <ArrowRight size={14} />}</Button>}
          </div>
        </section>;
      })}</div>}
      <p className={s.caption}>Yeni ifadeleri yalnızca tanımakla kalma; onları cümlelerinin bir parçası yap.</p>
    </div>
  </>;
}
