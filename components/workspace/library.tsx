"use client";

import {
  ArrowRight,
  LayoutGrid,
  List,
  Plus,
  Search,
  Table2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntryTable, EntryCard } from "@/components/vocabulary/entry-table";
import { EntryDetailDrawer } from "@/components/vocabulary/entry-detail-drawer";
import { softDeleteVocabularyEntry, updateVocabularyEntry } from "@/lib/vocabulary/mutations";
import type { MutationResult } from "@/lib/vocabulary/types";
import {
  entryTypes,
  levels,
  statuses,
  type Entry,
} from "@/lib/mock-data";
import s from "./workspace.module.css";

export function Library({ initialEntries, loadError, initialSelectedId, today, weekStart }: {
  initialEntries: Entry[];
  loadError: string | null;
  initialSelectedId: string | null;
  today: string;
  weekStart: string;
}) {
  const router = useRouter();
  const [localChanges, setLocalChanges] = useState<Record<string, Entry>>({});
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const entries = initialEntries
    .filter((item) => !removedIds.includes(item.id))
    .map((item) => localChanges[item.id] || item);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [view, setView] = useState<"table" | "cards" | "list">("table");
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId);
  const sources = Array.from(new Set(entries.map((e) => e.sourceType)));
  const filtered = entries.filter(
    (e) =>
      `${e.expression} ${e.meanings.join(" ")} ${e.tags.join(" ")}`
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr")) &&
      (!type || e.type === type) &&
      (!level || e.level === level) &&
      (!status || e.status === status) &&
      (!source || e.sourceType === source) &&
      (!date ||
        (date === "today"
          ? e.date === today
          : e.date >= weekStart)),
  );
  const select = (entry: Entry) => setSelectedId(entry.id);
  const hasFilters = !!(query || type || level || status || source || date);
  function reset() {
    setQuery("");
    setType("");
    setLevel("");
    setStatus("");
    setSource("");
    setDate("");
  }
  async function saveEntry(entry: Entry): Promise<MutationResult> {
    const outcome = await updateVocabularyEntry(entry.id, {
      expression: entry.expression,
      entryType: entry.type,
      cefrLevel: entry.level,
      englishExplanation: entry.definition,
      pronunciationIpa: entry.ipa,
      pronunciationReadable: entry.pronunciationReadable || "",
      userNote: entry.note,
    });
    if (outcome.ok) {
      setLocalChanges((current) => ({ ...current, [entry.id]: entry }));
      router.refresh();
    }
    return outcome;
  }
  async function deleteEntry(entry: Entry): Promise<MutationResult> {
    const outcome = await softDeleteVocabularyEntry(entry.id);
    if (outcome.ok) {
      setRemovedIds((current) => [...current, entry.id]);
      setSelectedId(null);
      router.refresh();
    }
    return outcome;
  }
  return (
    <>
      <PageHeader
        title="Kütüphane"
        description={`${entries.length} kayıt. Karşılaştığın İngilizce, kendi koleksiyonunda.`}
        actions={
          <ButtonLink href="/add" size="small">
            <Plus size={14} />
            Yeni kayıt
          </ButtonLink>
        }
      />
      <div className={s.stack}>
        <div className={s.toolbar}>
          <div className={s.search}>
            <Search />
            <Input
              aria-label="Kütüphanede ara"
              placeholder="İfade, anlam veya etiket ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={s.row}>
            <span className={s.caption}>{filtered.length} kayıt</span>
            <div className={s.viewSwitch} aria-label="Görünüm">
              {(
                [
                  { id: "table", icon: Table2, label: "Tablo görünümü" },
                  { id: "cards", icon: LayoutGrid, label: "Kart görünümü" },
                  { id: "list", icon: List, label: "Liste görünümü" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  aria-label={item.label}
                  aria-pressed={view === item.id}
                  onClick={() => setView(item.id)}
                >
                  <item.icon />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={s.filterRow}>
          <select
            className={s.select}
            aria-label="Tür filtresi"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Tüm türler</option>
            {entryTypes.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            className={s.select}
            aria-label="Seviye filtresi"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">Tüm seviyeler</option>
            {levels.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            className={s.select}
            aria-label="Durum filtresi"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tüm durumlar</option>
            {statuses.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            className={s.select}
            aria-label="Kaynak filtresi"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Tüm kaynaklar</option>
            {sources.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            className={s.select}
            aria-label="Tarih filtresi"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          >
            <option value="">Tüm tarihler</option>
            <option value="today">Bugün</option>
            <option value="week">Son 7 gün</option>
          </select>
          {hasFilters && (
            <Button variant="ghost" size="small" onClick={reset}>
              <X size={14} />
              Temizle
            </Button>
          )}
        </div>
        <section className={s.panel} aria-label="Kayıtlar">
          {loadError ? (
            <div className={s.emptyResults} role="alert">
              <h2>{loadError}</h2>
              <Button variant="secondary" size="small" style={{ marginTop: 16 }}
                onClick={() => router.refresh()}>Tekrar dene</Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className={s.emptyResults}>
              <h2>{hasFilters ? "Bu filtrelere uyan kayıt yok" : "Henüz kayıt yok"}</h2>
              <p style={{ marginTop: 8 }}>
                {hasFilters ? "Başka bir ifade ara veya filtreleri temizle." : "İlk ifadenle kütüphaneni oluşturmaya başla."}
              </p>
              {hasFilters ? <Button variant="secondary" size="small" style={{ marginTop: 16 }} onClick={reset}>Filtreleri temizle</Button>
                : <ButtonLink href="/add" size="small" style={{ marginTop: 16 }}>İfade ekle</ButtonLink>}
            </div>
          ) : (
            <>
              <div className={s.desktopEntries}>
                {view === "table" ? (
                  <EntryTable entries={filtered} onSelect={select} />
                ) : (
                  <div
                    className={view === "cards" ? s.entryCards : s.entryList}
                    style={view === "cards" ? { padding: 16 } : undefined}
                  >
                    {filtered.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        onSelect={select}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className={s.mobileEntries}>
                {filtered.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onSelect={select} />
                ))}
              </div>
            </>
          )}
          <div className={s.tableFooter}>
            <span>{filtered.length} kayıt gösteriliyor</span>
            <span className={s.row}>
              1 / 1<ArrowRight size={14} />
            </span>
          </div>
        </section>
        <p className={s.caption}>
          Bir kaydı seçerek anlamlarını, örneklerini ve kaynak bağlamını incele.
        </p>
      </div>
      <EntryDetailDrawer
        entry={entries.find((e) => e.id === selectedId) ?? null}
        onClose={() => {
          setSelectedId(null);
          if (initialSelectedId) router.replace("/library", { scroll: false });
        }}
        onSave={saveEntry}
        onDelete={deleteEntry}
      />
    </>
  );
}
