"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AIProcessingPanel, AIResultCard } from "@/components/ai/processing";
import { usePrototype } from "./prototype-provider";
import {
  addExamples,
  mockEntries,
  processingStages,
  type Entry,
} from "@/lib/mock-data";
import s from "./workspace.module.css";
import { useIsMobile } from "@/lib/use-is-mobile";

export function Add() {
  const { addEntries } = usePrototype();
  const isMobile = useIsMobile();
  const [metadataOpen, setMetadataOpen] = useState<boolean | null>(null);
  const [processed, setProcessed] = useState(false);
  const [input, setInput] = useState(addExamples.join("\n"));
  const [sourceType, setSourceType] = useState("Dizi");
  const [sourceName, setSourceName] = useState("Netflix");
  const [show, setShow] = useState("Friends");
  const [season, setSeason] = useState("2");
  const [episode, setEpisode] = useState("5");
  const [deck, setDeck] = useState("Günlük İngilizce");
  const [tags, setTags] = useState("günlük hayat, konuşma");
  const [stage, setStage] = useState(3);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<Entry[]>([]);
  const [saved, setSaved] = useState(false);
  const [unknown, setUnknown] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );
  const expressions = Array.from(
    new Set(
      input
        .split(/\n/)
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  );
  function process() {
    if (!expressions.length || processing) return;
    setSaved(false);
    setResults([]);
    setStage(0);
    setProcessing(true);
    setUnknown([]);
    setProcessed(true);
    const matched: Entry[] = [];
    const unmatched: string[] = [];
    expressions.forEach((expression, index) => {
      const template = mockEntries.find(
        (e) =>
          e.expression.toLowerCase().replace(/[?.]/g, "") ===
          expression.toLowerCase().replace(/[?.]/g, ""),
      );
      if (template)
        matched.push({
          ...template,
          id: `added-${Date.now()}-${index}`,
          status: "Yeni",
          sourceType,
          source:
            sourceType === "Dizi"
              ? `${show || sourceName} · S${season.padStart(2, "0")} E${episode.padStart(2, "0")}`
              : sourceName || "Manuel kayıt",
          decks: [deck],
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          date: "2026-10-11",
        });
      else unmatched.push(expression);
    });
    let next = 0;
    timer.current = setInterval(() => {
      next += 1;
      setStage(next);
      if (next >= processingStages.length) {
        if (timer.current) clearInterval(timer.current);
        timer.current = null;
        setProcessing(false);
        setResults(matched);
        setUnknown(unmatched);
      }
    }, 320);
  }
  return (
    <>
      <PageHeader
        title="Ekle"
        description="Bir diziden, kitaptan ya da hayatın içinden. Öğrenmek istediğin ifadeleri ekle."
        actions={<Badge tone="neutral">Örnek çalışma alanı</Badge>}
      />
      <div className={s.addGrid}>
        <section className={s.panel}>
          <div className={s.panelHead}>
            <div>
              <h2>Ne öğrenmek istiyorsun?</h2>
              <p>Her satıra bir kelime, ifade veya cümle yaz.</p>
            </div>
            <Plus size={18} className={s.muted} />
          </div>
          <div className={s.panelBody}>
            <label className={s.field}>
              <span className={s.fieldLabel}>İngilizce ifadeler</span>
              <Textarea
                className={s.entryInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={processing}
              />
            </label>
            <div className={s.spread} style={{ marginTop: 12 }}>
              <span className={s.caption}>
                {expressions.length} ifade algılandı
              </span>
              <Button
                variant="ghost"
                size="small"
                onClick={() => setInput(addExamples.join("\n"))}
                disabled={processing}
              >
                Örnekleri kullan
              </Button>
            </div>
            <div className={s.addAction}>
              <Button
                onClick={process}
                disabled={processing || !expressions.length}
                style={{ width: "100%" }}
              >
                <Sparkles size={16} />
                {processing ? "İfadeler işleniyor..." : "AI ile İşle"}
              </Button>
              <p className={s.notice} style={{ marginTop: 12 }}>
                <Info size={14} />
                Bu prototip hazır örneklerle çalışır; gerçek AI bağlantısı
                yoktur.
              </p>
            </div>
            <details className={s.metadata} open={metadataOpen ?? !isMobile}>
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setMetadataOpen(!(metadataOpen ?? !isMobile));
                }}
              >
                Kaynak ve organizasyon{" "}
                <span className={s.row}>
                  <span className={s.caption}>İsteğe bağlı</span>
                  <ChevronDown />
                </span>
              </summary>
              <div>
                <div className={s.formGrid}>
                  <label className={s.field}>
                    <span>Kaynak türü</span>
                    <select
                      className={s.select}
                      value={sourceType}
                      onChange={(e) => setSourceType(e.target.value)}
                    >
                      {[
                        "Dizi",
                        "Video",
                        "Podcast",
                        "Kitap",
                        "Makale",
                        "Manuel",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label className={s.field}>
                    <span>Kaynak adı</span>
                    <Input
                      value={sourceName}
                      onChange={(e) => setSourceName(e.target.value)}
                      placeholder="Netflix, YouTube..."
                    />
                  </label>
                </div>
                {sourceType === "Dizi" && (
                  <div className={s.formThree} style={{ marginTop: 16 }}>
                    <label className={s.field}>
                      <span>Dizi</span>
                      <Input
                        value={show}
                        onChange={(e) => setShow(e.target.value)}
                      />
                    </label>
                    <label className={s.field}>
                      <span>Sezon</span>
                      <Input
                        type="number"
                        min={1}
                        value={season}
                        onChange={(e) => setSeason(e.target.value)}
                      />
                    </label>
                    <label className={s.field}>
                      <span>Bölüm</span>
                      <Input
                        type="number"
                        min={1}
                        value={episode}
                        onChange={(e) => setEpisode(e.target.value)}
                      />
                    </label>
                  </div>
                )}
                <div className={s.formGrid} style={{ marginTop: 16 }}>
                  <label className={s.field}>
                    <span>Deck</span>
                    <select
                      className={s.select}
                      value={deck}
                      onChange={(e) => setDeck(e.target.value)}
                    >
                      <option>Günlük İngilizce</option>
                      <option>Friends</option>
                      <option>İş İngilizcesi</option>
                    </select>
                  </label>
                  <label className={s.field}>
                    <span>Etiketler</span>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Virgülle ayır"
                    />
                  </label>
                </div>
              </div>
            </details>

            {unknown.length > 0 && (
              <p role="status" className={s.feedback}>
                “{unknown.join(", ")}” için hazır örnek bulunamadı. Yukarıdaki
                örnek ifadeleri deneyebilirsin.
              </p>
            )}
            {results.length > 0 && (
              <div className={s.formSection}>
                <div className={s.spread}>
                  <span className={s.small}>
                    {results.length} kayıt öğrenmeye hazır
                  </span>
                  {saved ? (
                    <ButtonLink href="/library" size="small">
                      Kütüphaneye git
                      <ArrowRight size={14} />
                    </ButtonLink>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => {
                        addEntries(results);
                        setSaved(true);
                      }}
                    >
                      <Check size={14} />
                      Kütüphaneye kaydet
                    </Button>
                  )}
                </div>
                <p role="status" className={s.caption} style={{ marginTop: 8 }}>
                  {saved
                    ? "Kayıtlar bu çalışma oturumunda kütüphanene eklendi."
                    : "Sonuçları incele, ardından koleksiyonuna ekle."}
                </p>
              </div>
            )}
          </div>
        </section>
        <aside className={s.stack} aria-label="İşleme ve sonuçlar">
          <AIProcessingPanel
            stage={stage}
            processing={processing}
            unsupported={processed && !processing && !results.length}
          />
          <div className={s.spread}>
            <h2 style={{ fontSize: 16 }}>İşlenmiş önizleme</h2>
            <span className={s.caption}>
              {processed ? results.length : 2} kayıt
            </span>
          </div>
          {(processed ? results : [mockEntries[0], mockEntries[2]])
            .slice(0, 4)
            .map((entry) => (
              <AIResultCard key={entry.id} entry={entry} />
            ))}
        </aside>
      </div>
    </>
  );
}
