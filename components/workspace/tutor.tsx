"use client";

import { ArrowUp, BookOpen, Plus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/data/visualizations";
import { TutorMessage, type TutorUiMessage } from "@/components/ai/tutor-message";
import { EntryTypeBadge, LevelBadge } from "@/components/vocabulary/entry-badges";
import { askTutor } from "@/lib/tutor/actions";
import type { TutorContext } from "@/lib/tutor/context";
import s from "./workspace.module.css";

const prompts = [
  "Bugünkü kelimelerimle benimle konuş",
  "Son 20 kaydımdan test yap",
  "Zorlandığım kalıpları öğret",
  "B1 seviyesinde diyalog oluştur",
];
const initial: TutorUiMessage[] = [{
  id: "welcome", role: "assistant",
  text: "Merhaba! Koleksiyonundaki ifadelerle konuşma pratiği yapabiliriz. Bir konu seç veya İngilizce bir cümle yaz.",
}];

export function Tutor({ context }: { context: TutorContext }) {
  const [messages, setMessages] = useState<TutorUiMessage[]>(initial);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldScroll = useRef(false);
  useEffect(() => {
    if (shouldScroll.current) scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight, behavior: "smooth",
    });
  }, [messages]);
  function send(value = input) {
    const trimmed = value.trim();
    if (!trimmed || pending) return;
    const history = messages.filter((item) => item.id !== "welcome")
      .slice(-8).map((item) => ({ role: item.role, text: item.text }));
    setInput(""); setError(""); shouldScroll.current = true;
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
    startTransition(async () => {
      try {
        const result = await askTutor(trimmed, history);
        if (!result.ok) { setInput(trimmed); setError(result.message); return; }
        setMessages((current) => [...current, {
          id: crypto.randomUUID(), role: "assistant",
          text: result.output.reply, correction: result.output.correction,
        }]);
      } catch {
        setInput(trimmed);
        setError("AI Tutor bağlantısı kurulamadı. Mesajın korundu.");
      }
      composerRef.current?.focus();
    });
  }
  return <>
    <PageHeader title="AI Tutor" description="Kendi kelimelerinle konuş. Hata yap, düzelt, daha doğal ifade et."
      actions={<Button variant="secondary" size="small" disabled={pending}
        onClick={() => { shouldScroll.current = false; setMessages(initial); setInput(""); setError(""); }}>
        <Plus size={14} /> Yeni konuşma</Button>} />
    <div className={s.tutorGrid}>
      <section className={`${s.panel} ${s.chat}`} aria-label="Tutor konuşması">
        <div className={s.chatHead}>
          <span className={s.avatar}><Sparkles /></span>
          <div><strong className={s.small}>İngilizce konuşma pratiği</strong>
            <p className={s.caption}>Kendi koleksiyonun · {context.level} seviyesi</p></div>
          <Badge tone="neutral" style={{ marginLeft: "auto" }} className={s.miniBadge}>
            {pending ? "Yanıt hazırlanıyor" : "Gerçek AI"}</Badge>
        </div>
        <div className={s.messages} ref={scrollRef} aria-label="Mesajlar" role="log" aria-live="polite">
          {messages.map((message) => <TutorMessage key={message.id} message={message} />)}
          {pending && <p className={s.caption} role="status">AI Tutor düşünüyor…</p>}
        </div>
        <div className={s.chatFoot}>
          <div className={s.prompts}>{prompts.map((prompt) =>
            <Button key={prompt} variant="secondary" size="small" disabled={pending}
              onClick={() => send(prompt)}>{prompt}</Button>)}</div>
          <form onSubmit={(event) => { event.preventDefault(); send(); }}>
            <div className={s.composer}>
              <textarea ref={composerRef} rows={1} aria-label="Tutor mesajı"
                placeholder="İngilizce bir mesaj yaz..." maxLength={2000} value={input}
                disabled={pending} onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault(); send();
                  }
                }} />
              <Button type="submit" size="small" disabled={!input.trim() || pending} aria-label="Mesaj gönder">
                <ArrowUp size={16} /></Button>
            </div>
            {error && <p className={s.warning} role="alert" style={{ marginTop: 8 }}>{error}</p>}
            <p className={s.caption} style={{ marginTop: 8 }}>Enter ile gönder · Shift + Enter ile yeni satır</p>
          </form>
        </div>
      </section>
      <aside className={`${s.stack} ${s.tutorContext}`} aria-label="Öğrenme bağlamı">
        <ChartCard title="Son eklenen ifadeler" subtitle="Konuşmanda kullanmayı dene.">
          {context.recent.length ? context.recent.slice(0, 3).map((entry) =>
            <div key={entry.id} className={s.contextWord}>
              <div><strong style={{ fontWeight: 500 }}>{entry.expression}</strong><p>{entry.meaning}</p></div>
              <EntryTypeBadge type={entry.type === "phrasal_verb" ? "Phrasal Verb"
                : entry.type === "sentence" ? "Sentence" : entry.type === "phrase" ? "Phrase" : "Word"} />
            </div>) : <p className={s.caption}>Koleksiyonuna ifade eklediğinde burada görünür.</p>}
        </ChartCard>
        <ChartCard title="Zorlandıkların">
          {context.difficult.length || context.mistakes.length ? <>
            {context.difficult.slice(0, 3).map((entry) => <div key={entry.id} className={s.contextWord}>
              <div><span>{entry.expression}</span><p>{entry.meaning}</p></div><span className={s.warning}>!</span>
            </div>)}
            {context.mistakes.slice(0, 2).map((item) =>
              <p key={item.expression} className={s.caption}>{item.expression} · {item.timesMissed} hata</p>)}
          </> : <p className={s.caption}>Henüz zorlandığın ifade yok.</p>}
        </ChartCard>
        <ChartCard title="Çalışma bağlamı">
          <div className={s.row}><BookOpen size={18} className={s.accent} />
            <div><p className={s.small}>{context.activeDeck?.name || "Aktif deck yok"}</p>
              <p className={s.caption}>{context.activeDeck ? `${context.activeDeck.count} ifade` : "Library’den deck oluşturabilirsin."}</p></div></div>
          <div className={s.spread} style={{ marginTop: 20 }}>
            <span className={s.small}>İngilizce seviyen</span>
            <LevelBadge level={context.level === "A1" || context.level === "A2" ||
              context.level === "B1" || context.level === "B2" || context.level === "C1" ||
              context.level === "C2" ? context.level : "B1"} />
          </div>
          <p className={s.caption} style={{ marginTop: 12 }}>Yanıtlar seviyene ve kendi koleksiyonuna göre şekillenir.</p>
        </ChartCard>
      </aside>
    </div>
  </>;
}
