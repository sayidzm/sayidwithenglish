"use client";

import { ArrowUp, BookOpen, Plus, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/data/visualizations";
import { TutorMessage } from "@/components/ai/tutor-message";
import {
  EntryTypeBadge,
  LevelBadge,
} from "@/components/vocabulary/entry-badges";
import { usePrototype } from "./prototype-provider";
import {
  initialConversation,
  tutorPrompts,
  tutorReplies,
  type ChatMessage,
} from "@/lib/mock-data";
import s from "./workspace.module.css";

export function Tutor() {
  const { entries, settings } = usePrototype();
  const [messages, setMessages] = useState(initialConversation);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const shouldScroll = useRef(false);
  useEffect(() => {
    if (shouldScroll.current)
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
  }, [messages]);
  function send(text = input, promptIndex = -1) {
    if (!text.trim()) return;
    const reply =
      promptIndex >= 0
        ? tutorReplies[promptIndex]
        : "Thanks for sharing! Let's practise a follow-up: ‘I figured it out on my own.’ Şimdi ‘be supposed to’ kullanarak bir cümle yazmayı dene. Bu konuşmadaki yanıtlar hazır örneklerden oluşuyor.";
    shouldScroll.current = true;
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: "user", text: text.trim() },
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: reply,
      } satisfies ChatMessage,
    ]);
    setInput("");
    composerRef.current?.focus();
  }
  return (
    <>
      <PageHeader
        title="AI Tutor"
        description="Kendi kelimelerinle konuş. Hata yap, düzelt, daha doğal ifade et."
        actions={
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              shouldScroll.current = false;
              setMessages(initialConversation);
              setInput("");
              scrollRef.current?.scrollTo({ top: 0 });
            }}
          >
            <Plus size={14} />
            Yeni konuşma
          </Button>
        }
      />
      <div className={s.tutorGrid}>
        <section
          className={`${s.panel} ${s.chat}`}
          aria-label="Tutor konuşması"
        >
          <div className={s.chatHead}>
            <span className={s.avatar}>
              <Sparkles />
            </span>
            <div>
              <strong className={s.small}>İngilizce konuşma pratiği</strong>
              <p className={s.caption}>
                Günlük İngilizce · {settings.currentLevel} seviyesi
              </p>
            </div>
            <Badge
              tone="neutral"
              style={{ marginLeft: "auto" }}
              className={s.miniBadge}
            >
              Örnek konuşma
            </Badge>
          </div>
          <div
            className={s.messages}
            ref={scrollRef}
            aria-label="Mesajlar"
            role="log"
            aria-live="polite"
          >
            {messages.map((message) => (
              <TutorMessage key={message.id} message={message} />
            ))}
          </div>
          <div className={s.chatFoot}>
            <div className={s.prompts}>
              {tutorPrompts.map((prompt, i) => (
                <Button
                  key={prompt}
                  variant="secondary"
                  size="small"
                  onClick={() => send(prompt, i)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <div className={s.composer}>
                <textarea
                  ref={composerRef}
                  rows={1}
                  aria-label="Tutor mesajı"
                  placeholder="İngilizce bir mesaj yaz..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="small"
                  disabled={!input.trim()}
                  aria-label="Mesaj gönder"
                >
                  <ArrowUp size={16} />
                </Button>
              </div>
              <p className={s.caption} style={{ marginTop: 8 }}>
                Enter ile gönder · Shift + Enter ile yeni satır
              </p>
            </form>
          </div>
        </section>
        <aside
          className={`${s.stack} ${s.tutorContext}`}
          aria-label="Öğrenme bağlamı"
        >
          <ChartCard
            title="Bugünkü kelimeler"
            subtitle="Konuşmanda kullanmayı dene."
          >
            {entries.slice(0, 3).map((entry) => (
              <div key={entry.id} className={s.contextWord}>
                <div>
                  <strong style={{ fontWeight: 500 }}>
                    {entry.expression}
                  </strong>
                  <p>{entry.meanings[0]}</p>
                </div>
                <EntryTypeBadge type={entry.type} />
              </div>
            ))}
          </ChartCard>
          <ChartCard title="Zorlandıkların">
            {entries
              .filter((e) => e.status === "Zor")
              .map((entry) => (
                <div key={entry.id} className={s.contextWord}>
                  <div>
                    <span>{entry.expression}</span>
                    <p>{entry.meanings[0]}</p>
                  </div>
                  <span className={s.warning}>!</span>
                </div>
              ))}
          </ChartCard>
          <ChartCard title="Çalışma bağlamı">
            <div className={s.row}>
              <BookOpen size={18} className={s.accent} />
              <div>
                <p className={s.small}>Günlük İngilizce</p>
                <p className={s.caption}>Aktif deck · 128 ifade</p>
              </div>
            </div>
            <div className={s.spread} style={{ marginTop: 20 }}>
              <span className={s.small}>İngilizce seviyen</span>
              <LevelBadge level={settings.currentLevel} />
            </div>
            <p className={s.caption} style={{ marginTop: 12 }}>
              Yanıtlar seviyene ve kendi koleksiyonuna göre şekillenir.
            </p>
          </ChartCard>
        </aside>
      </div>
    </>
  );
}
