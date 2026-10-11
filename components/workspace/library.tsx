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
import { PageHeader } from "@/components/layout/page-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EntryTable, EntryCard } from "@/components/vocabulary/entry-table";
import { EntryDetailDrawer } from "@/components/vocabulary/entry-detail-drawer";
import { usePrototype } from "./prototype-provider";
import {
  entryTypes,
  levels,
  statuses,
  overview,
  mockEntries,
  type Entry,
} from "@/lib/mock-data";
import s from "./workspace.module.css";

export function Library() {
  const { entries } = usePrototype();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [view, setView] = useState<"table" | "cards" | "list">("table");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
        (date === "today" ? e.date === "2026-10-11" : e.date >= "2026-10-05")),
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
  return (
    <>
      <PageHeader
        title="Kütüphane"
        description={`${overview.total + entries.length - mockEntries.length} kayıt. Karşılaştığın İngilizce, kendi koleksiyonunda.`}
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
            <span className={s.caption}>{filtered.length} örnek kayıt</span>
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
          {filtered.length === 0 ? (
            <div className={s.emptyResults}>
              <h2>Bu filtrelere uyan kayıt yok</h2>
              <p style={{ marginTop: 8 }}>
                Başka bir ifade ara veya filtreleri temizle.
              </p>
              <Button
                variant="secondary"
                size="small"
                style={{ marginTop: 16 }}
                onClick={reset}
              >
                Filtreleri temizle
              </Button>
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
            <span>{filtered.length} kayıt gösteriliyor · Örnek koleksiyon</span>
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
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
