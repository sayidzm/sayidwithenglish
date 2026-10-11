"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Info,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AIProcessingPanel, AIResultCard } from "@/components/ai/processing";
import {
  addExamples,
  entryTypes,
  levels,
  processingStages,
  type Entry,
} from "@/lib/mock-data";
import { processNextVocabularyChunk, startVocabularyJob, type JobStatus }
  from "@/lib/ai/jobs";
import { createVocabularyEntries } from "@/lib/vocabulary/mutations";
import { sourceTypeToDb } from "@/lib/vocabulary/mappers";
import type { SaveFailure, VocabularyInput } from "@/lib/vocabulary/types";
import s from "./workspace.module.css";
import { useIsMobile } from "@/lib/use-is-mobile";

const noSubscription = () => () => {};

export function Add({ initialJob = null }: { initialJob?: JobStatus | null }) {
  const isMobile = useIsMobile();
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);
  const [metadataOpen, setMetadataOpen] = useState<boolean | null>(null);
  const [processed, setProcessed] = useState(!!initialJob);
  const [input, setInput] = useState(initialJob?.items.map((item) => item.expression).join("\n") || "");
  const [sourceType, setSourceType] = useState("Manuel");
  const [sourceName, setSourceName] = useState("");
  const [show, setShow] = useState("");
  const [season, setSeason] = useState("");
  const [episode, setEpisode] = useState("");
  const [deck, setDeck] = useState("");
  const [tags, setTags] = useState("");
  const [stage, setStage] = useState(initialJob?.processed === initialJob?.total && initialJob?.total
    ? processingStages.length : -1);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<VocabularyInput[]>(() =>
    initialJob?.items.flatMap((item) => item.draft ? [withMetadata(item.draft)] : []) || []);
  const [jobId, setJobId] = useState(initialJob?.id || "");
  const [progress, setProgress] = useState({ done: initialJob?.processed || 0, total: initialJob?.total || 0 });
  const [saved, setSaved] = useState(false);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [failures, setFailures] = useState<SaveFailure[]>([]);
  const [listText, setListText] = useState<Record<string, string>>({});
  const expressions = Array.from(
    new Set(
      input
        .split(/\n/)
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  );
  function withMetadata(draft: VocabularyInput): VocabularyInput {
    return {
      ...draft,
      source: {
        type: sourceTypeToDb[sourceType] || "other", name: sourceName,
        seriesName: sourceType === "Dizi" ? show : "",
        seasonNumber: sourceType === "Dizi" && Number(season) > 0 ? Number(season) : null,
        episodeNumber: sourceType === "Dizi" && Number(episode) > 0 ? Number(episode) : null,
        sentence: draft.source?.sentence || "",
      },
      decks: deck.trim() ? [deck.trim()] : [],
      tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };
  }
  function displayJob(job: JobStatus) {
    setProgress({ done: job.processed, total: job.total });
    setResults(job.items.flatMap((item) => item.draft ? [withMetadata(item.draft)] : []));
    setFailures(job.items.flatMap((item) => item.status === "failed" || item.status === "duplicate"
      ? [{ expression: item.expression, message: item.error || "Bu ifade zaten mevcut.",
        duplicateId: item.duplicateId }] : []));
    setUnknown(job.items.filter((item) => item.status === "failed").map((item) => item.expression));
    setStage(job.processed === job.total ? processingStages.length : 0);
  }
  async function advance(id: string, current: JobStatus) {
    let next = current;
    while (next.processed < next.total) {
      const update = await processNextVocabularyChunk(id);
      if (!update || update.processed === next.processed) break;
      next = update;
      setProgress({ done: next.processed, total: next.total });
      if (next.items.some((item) => item.status === "failed" &&
          /sınırına ulaşıldı|kullanılamıyor|geçersiz|reddedildi/.test(item.error || ""))) break;
    }
    displayJob(next);
  }
  async function process() {
    if (!expressions.length || expressions.length > 20 || processing) return;
    setSaved(false);
    setSaveMessage("");
    setFailures([]);
    setListText({});
    setResults([]);
    setJobId("");
    setProgress({ done: 0, total: expressions.length });
    setStage(0);
    setProcessing(true);
    setUnknown([]);
    setProcessed(true);
    try {
      const started = await startVocabularyJob(expressions);
      if (!started.ok) { setSaveMessage(started.message); return; }
      setJobId(started.job.id);
      await advance(started.job.id, started.job);
    } catch {
      setSaveMessage("AI işlemi tamamlanamadı. Girdilerin korundu; yeniden deneyebilirsin.");
    } finally { setProcessing(false); }
  }
  function manualDraft(expression: string): VocabularyInput {
    return withMetadata({ expression, entryType: "Phrase", cefrLevel: "B1",
      englishExplanation: "", pronunciationIpa: "", pronunciationReadable: "",
      originalInput: expression, userNote: "", meanings: [], examples: [], similar: [],
      source: null, decks: [], tags: [] });
  }
  function continueManually() {
    setResults(expressions.map(manualDraft));
    setUnknown(expressions);
    setProcessed(true);
    setStage(-1);
    setFailures([]);
    setSaveMessage("İfadelerini elle tamamlayıp kaydedebilirsin.");
  }
  function updateResult(index: number, patch: Partial<VocabularyInput>) {
    setResults((current) => current.map((item, i) => i === index ? { ...item, ...patch } : item));
    setSaved(false);
  }
  function updateList(index: number, field: "meanings" | "similar" | "decks" | "tags", raw: string) {
    setListText((current) => ({ ...current, [`${index}:${field}`]: raw }));
    updateResult(index, {
      [field]: raw.split(field === "meanings" ? "\n" : ",")
        .map((item) => item.trim()).filter(Boolean),
    });
  }
  async function save() {
    if (saving || !results.length) return;
    const incompleteExample = results.find((result) => result.examples.some((example) =>
      Boolean(example.english.trim()) !== Boolean(example.turkish.trim())));
    if (incompleteExample) {
      setSaveMessage(`${incompleteExample.expression}: Örnek cümle ve Türkçe çevirisini birlikte doldur ya da boş satırı kaldır.`);
      return;
    }
    setSaving(true);
    setSaveMessage("");
    setFailures([]);
    try {
      const outcome = await createVocabularyEntries(results.map((result) => ({
        ...result,
        examples: result.examples.filter((example) => example.english.trim() && example.turkish.trim()),
      })));
      setFailures(outcome.failures);
      setSaved(outcome.savedCount > 0 && outcome.failures.length === 0);
      if (outcome.failures.length) {
        setResults((current) => current.filter((item) =>
          outcome.failures.some((failure) => failure.expression === item.expression)));
        setListText({});
      }
      setSaveMessage(outcome.failures.length
        ? `${outcome.savedCount} kayıt kaydedildi; ${outcome.failures.length} kayıt için işlem tamamlanamadı.`
        : `${outcome.savedCount} kayıt kütüphanene kaydedildi.`);
    } catch {
      setSaveMessage("Kayıtlar kaydedilemedi. Bağlantını kontrol edip tekrar dene.");
    } finally {
      setSaving(false);
    }
  }
  function preview(draft: VocabularyInput, index: number): Entry {
    return {
      id: `preview-${index}`,
      expression: draft.expression,
      type: draft.entryType,
      level: draft.cefrLevel,
      status: "Yeni",
      meanings: draft.meanings,
      definition: draft.englishExplanation,
      ipa: draft.pronunciationIpa,
      examples: draft.examples,
      similar: draft.similar,
      source: draft.source?.name || "Manuel kayıt",
      sourceType,
      sourceSentence: draft.source?.sentence || "",
      date: new Date().toISOString().slice(0, 10),
      decks: draft.decks,
      tags: draft.tags,
      note: draft.userNote,
    };
  }
  return (
    <>
      <PageHeader
        title="Ekle"
        description="Bir diziden, kitaptan ya da hayatın içinden. Öğrenmek istediğin ifadeleri ekle."
        actions={<Badge tone="blue">Google AI</Badge>}
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
          <fieldset className={s.panelBody} disabled={!hydrated}
            style={{ border: 0, margin: 0, minWidth: 0 }}>
            <label className={s.field}>
              <span className={s.fieldLabel}>İngilizce ifadeler</span>
              <Textarea
                className={s.entryInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={addExamples.join("\n")}
                disabled={processing || saving}
              />
            </label>
            <div className={s.spread} style={{ marginTop: 12 }}>
              <span className={s.caption}>
                {expressions.length} ifade algılandı · en fazla 20
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
            {expressions.length > 20 && (
              <p role="alert" className={s.feedback}>
                Tek seferde en fazla 20 ifade işlenebilir. Fazlasını sonraki adımda ekle.
              </p>
            )}
            <div className={s.addAction}>
              <Button
                onClick={process}
                disabled={processing || saving || !expressions.length || expressions.length > 20}
                style={{ width: "100%" }}
              >
                <Sparkles size={16} />
                {processing ? `İşleniyor · ${progress.done} / ${progress.total}` : "AI ile İşle"}
              </Button>
              <p className={s.notice} style={{ marginTop: 12 }}>
                <Info size={14} />
                AI sonuçlarını kaydetmeden önce inceleyebilirsin. Kaynak ve deck
                bilgileri yalnızca onayından sonra kaydedilir.
              </p>
              <div className={s.row} style={{ marginTop: 8 }}>
                <Button variant="ghost" size="small" disabled={processing || saving || !expressions.length}
                  onClick={continueManually}>Elle devam et</Button>
                {jobId && progress.done < progress.total && !processing && (
                  <Button variant="secondary" size="small" onClick={async () => {
                    setProcessing(true);
                    try {
                      const next = await processNextVocabularyChunk(jobId);
                      if (next) await advance(jobId, next);
                    } finally { setProcessing(false); }
                  }}>İşleme devam et</Button>
                )}
              </div>
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
                    <Input
                      value={deck}
                      onChange={(e) => setDeck(e.target.value)}
                      list="deck-suggestions"
                      placeholder="Mevcut veya yeni deck adı"
                    />
                    <datalist id="deck-suggestions">
                      <option value="Günlük İngilizce" />
                      <option value="Friends" />
                      <option value="İş İngilizcesi" />
                    </datalist>
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
                “{unknown.join(", ")}” AI ile tamamlanamadı. Bilgilerini
                elle tamamlayıp kaydedebilir veya yeniden işleyebilirsin.
              </p>
            )}
            {results.map((result, index) => (
              <details className={s.metadata} key={`${result.originalInput}-${index}`}
                open={!result.aiJobItemId}>
                <summary>
                  {result.expression}
                  <span className={s.row}><span className={s.caption}>Bilgileri düzenle</span><ChevronDown size={14} /></span>
                </summary>
                <div>
                <div className={s.formGrid}>
                  <label className={s.field}>
                    <span>İfade türü</span>
                    <select className={s.select} value={result.entryType}
                      onChange={(event) => updateResult(index, { entryType: event.target.value as VocabularyInput["entryType"] })}>
                      {entryTypes.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className={s.field}>
                    <span>Seviye</span>
                    <select className={s.select} value={result.cefrLevel}
                      onChange={(event) => updateResult(index, { cefrLevel: event.target.value as VocabularyInput["cefrLevel"] })}>
                      {levels.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>
                <label className={s.field} style={{ marginTop: 12 }}>
                  <span>İngilizce açıklama</span>
                  <Input value={result.englishExplanation} placeholder="Kısa açıklama (isteğe bağlı)"
                    onChange={(event) => updateResult(index, { englishExplanation: event.target.value })} />
                </label>
                <div className={s.formGrid} style={{ marginTop: 12 }}>
                  <label className={s.field}>
                    <span>IPA telaffuz</span>
                    <Input value={result.pronunciationIpa} placeholder="/ˈfɪɡər aʊt/"
                      onChange={(event) => updateResult(index, { pronunciationIpa: event.target.value })} />
                  </label>
                  <label className={s.field}>
                    <span>Okunabilir telaffuz</span>
                    <Input value={result.pronunciationReadable} placeholder="figır aut"
                      onChange={(event) => updateResult(index, { pronunciationReadable: event.target.value })} />
                  </label>
                </div>
                <label className={s.field} style={{ marginTop: 12 }}>
                  <span>Türkçe anlamlar (her satıra bir anlam)</span>
                  <Textarea value={listText[`${index}:meanings`] ?? result.meanings.join("\n")} placeholder="anlamak\nçözmek"
                    onChange={(event) => updateList(index, "meanings", event.target.value)}
                    style={{ minHeight: 76 }} />
                </label>
                <label className={s.field} style={{ marginTop: 12 }}>
                  <span>Benzer ifadeler (virgülle ayır)</span>
                  <Input value={listText[`${index}:similar`] ?? result.similar.join(", ")}
                    onChange={(event) => updateList(index, "similar", event.target.value)} />
                </label>
                <div className={s.formGrid} style={{ marginTop: 12 }}>
                  <label className={s.field}>
                    <span>Deck</span>
                    <Input value={listText[`${index}:decks`] ?? result.decks.join(", ")} placeholder="Virgülle ayır"
                      onChange={(event) => updateList(index, "decks", event.target.value)} />
                  </label>
                  <label className={s.field}>
                    <span>Etiketler</span>
                    <Input value={listText[`${index}:tags`] ?? result.tags.join(", ")} placeholder="Virgülle ayır"
                      onChange={(event) => updateList(index, "tags", event.target.value)} />
                  </label>
                </div>
                <label className={s.field} style={{ marginTop: 12 }}>
                  <span>Kişisel not</span>
                  <Input value={result.userNote}
                    onChange={(event) => updateResult(index, { userNote: event.target.value })} />
                </label>
                <label className={s.field} style={{ marginTop: 12 }}>
                  <span>Kaynak cümle</span>
                  <Input value={result.source?.sentence || ""} placeholder="İfadeyi gördüğün cümle"
                    onChange={(event) => updateResult(index, { source: result.source ? { ...result.source, sentence: event.target.value } : null })} />
                </label>
                <div className={s.formSection}>
                  <div className={s.spread}>
                    <h3>Örnek cümleler</h3>
                    <Button variant="ghost" size="small" onClick={() => updateResult(index, { examples: [...result.examples, { english: "", turkish: "" }] })}>
                      <Plus size={14} /> Örnek ekle
                    </Button>
                  </div>
                  {result.examples.map((example, exampleIndex) => (
                    <div className={s.formGrid} key={exampleIndex} style={{ marginTop: 8 }}>
                      <Input aria-label={`${result.expression} İngilizce örnek ${exampleIndex + 1}`}
                        value={example.english} placeholder="İngilizce cümle"
                        onChange={(event) => updateResult(index, { examples: result.examples.map((item, i) => i === exampleIndex ? { ...item, english: event.target.value } : item) })} />
                      <div className={s.row}>
                        <Input aria-label={`${result.expression} Türkçe örnek ${exampleIndex + 1}`}
                          value={example.turkish} placeholder="Türkçe çeviri"
                          onChange={(event) => updateResult(index, { examples: result.examples.map((item, i) => i === exampleIndex ? { ...item, turkish: event.target.value } : item) })} />
                        <Button variant="ghost" size="small" aria-label={`${result.expression} örnek ${exampleIndex + 1} kaldır`}
                          onClick={() => updateResult(index, { examples: result.examples.filter((_, i) => i !== exampleIndex) })}>
                          <X size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              </details>
            ))}
            {results.length > 0 && (
              <div className={s.formSection}>
                <div className={s.spread}>
                  <span className={s.small}>
                    {results.length} kayıt kaydetmeye hazır
                  </span>
                  {saved ? (
                    <ButtonLink href="/library" size="small">
                      Kütüphaneye git
                      <ArrowRight size={14} />
                    </ButtonLink>
                  ) : (
                    <Button
                      size="small"
                      onClick={save}
                      disabled={saving}
                    >
                      <Check size={14} />
                      {saving ? "Kaydediliyor..." : "Kütüphaneye kaydet"}
                    </Button>
                  )}
                </div>
                <p role="status" className={s.caption} style={{ marginTop: 8 }}>
                  {saveMessage || "Sonuçları incele, ardından koleksiyonuna ekle."}
                </p>
              </div>
            )}
            {!results.length && saveMessage && <p role="status" className={s.feedback}>{saveMessage}</p>}
            {failures.map((failure, index) => (
              <p role="alert" className={s.feedback} key={`${failure.expression}-${index}`}>
                {failure.expression && `${failure.expression}: `}{failure.message}{" "}
                {failure.duplicateId && <ButtonLink href={`/library?entry=${failure.duplicateId}`} variant="ghost" size="small">Mevcut kaydı aç <ArrowRight size={14} /></ButtonLink>}
              </p>
            ))}
          </fieldset>
        </section>
        <aside className={s.stack} aria-label="İşleme ve sonuçlar">
          <AIProcessingPanel
            stage={stage}
            processing={processing}
            unsupported={false}
            progress={progress.total ? progress : undefined}
          />
          <div className={s.spread}>
            <h2 style={{ fontSize: 16 }}>İşlenmiş önizleme</h2>
            <span className={s.caption}>
              {processed ? results.length : 0} kayıt
            </span>
          </div>
          {results.map(preview).slice(0, 4)
            .map((entry) => (
              <AIResultCard key={entry.id} entry={entry} />
            ))}
          {!results.length && <p className={s.caption}>
            İşlenmiş ifadeler burada önizlenecek. Girdilerin AI kullanılamadığında da korunur.
          </p>}
        </aside>
      </div>
    </>
  );
}
