"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, Check, Pencil, Trash2, Volume2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import {
  EntryTypeBadge,
  LevelBadge,
  LearningStatusBadge,
} from "./entry-badges";
import { entryTypes, levels, type Entry, type Example } from "@/lib/mock-data";
import type { MutationResult } from "@/lib/vocabulary/types";
import s from "@/components/workspace/workspace.module.css";

export function ExampleSentence({
  example,
  index,
}: {
  example: Example;
  index: number;
}) {
  return (
    <div className={s.example}>
      <span className={s.rowNumber}>{index + 1}</span>
      <div>
        <p lang="en">{example.english}</p>
        <small>{example.turkish}</small>
      </div>
    </div>
  );
}
export function Pronunciation({ ipa }: { ipa: string }) {
  return (
    <div className={s.row}>
      <span className={s.muted}>{ipa}</span>
      <Tooltip label="Ses önizlemesi sonraki aşamada eklenecek">
        <span>
          <Button
            variant="ghost"
            className={s.iconButton}
            aria-label="Telaffuzu dinle (yakında)"
            disabled
          >
            <Volume2 />
          </Button>
        </span>
      </Tooltip>
    </div>
  );
}
export function EntryDetailDrawer({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: Entry | null;
  onClose: () => void;
  onSave?: (entry: Entry) => Promise<MutationResult>;
  onDelete?: (entry: Entry) => Promise<MutationResult>;
}) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root
      open={!!entry}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={s.drawerOverlay} />
        <Dialog.Content
          className={s.drawer}
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            returnFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusRef.current?.focus();
          }}
        >
          {entry && <EntryDetail key={entry.id} entry={entry} onSave={onSave} onDelete={onDelete} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function EntryDetail({ entry, onSave, onDelete }: {
  entry: Entry;
  onSave?: (entry: Entry) => Promise<MutationResult>;
  onDelete?: (entry: Entry) => Promise<MutationResult>;
}) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(entry.note);
  const [expression, setExpression] = useState(entry.expression);
  const [type, setType] = useState(entry.type);
  const [level, setLevel] = useState(entry.level);
  const [definition, setDefinition] = useState(entry.definition);
  const [ipa, setIpa] = useState(entry.ipa);
  const [pronunciationReadable, setPronunciationReadable] = useState(entry.pronunciationReadable || "");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  async function save() {
    if (!expression.trim() || busy) {
      setError("İfade boş bırakılamaz.");
      return;
    }
    setBusy(true);
    setError("");
    const updated = {
      ...entry,
      expression: expression.trim(),
      type,
      level,
      definition,
      ipa,
      pronunciationReadable,
      note,
    };
    try {
      if (!onSave) {
        setError("Bu kayıt düzenlenemiyor.");
        return;
      }
      const result = await onSave(updated);
      if (!result.ok) {
        setError(result.message);
        setDuplicateId(result.duplicateId || null);
        return;
      }
    } catch {
      setError("Değişiklikler kaydedilemedi. Tekrar dene.");
      return;
    } finally {
      setBusy(false);
    }
    setEditing(false);
    setSaved(true);
  }
  async function remove() {
    if (!onDelete || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await onDelete(entry);
      if (!result.ok) setError(result.message);
    } catch {
      setError("Kayıt silinemedi. Tekrar dene.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className={s.drawerHead}>
        <div className={s.drawerTop}>
          <span>Kayıt detayı</span>
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              className={s.iconButton}
              aria-label="Detayı kapat"
            >
              <X />
            </Button>
          </Dialog.Close>
        </div>
        <Dialog.Title className={s.drawerTitle}>
          {entry.expression}
        </Dialog.Title>
        <div className={s.wrap} style={{ marginTop: "var(--space-3)" }}>
          <EntryTypeBadge type={entry.type} />
          <LevelBadge level={entry.level} />
          <span style={{ marginLeft: "auto" }}>
            <LearningStatusBadge status={entry.status} />
          </span>
        </div>
        <Pronunciation ipa={entry.ipa} />
        {entry.pronunciationReadable && <span className={s.caption}>{entry.pronunciationReadable}</span>}
      </header>
      <div className={s.drawerBody}>
        {editing && (
          <section className={s.detailSection}>
            <div className={s.stack}>
              <label className={s.field}>
                <span className={s.fieldLabel}>İfade</span>
                <Input value={expression} onChange={(e) => setExpression(e.target.value)} />
              </label>
              <div className={s.formGrid}>
                <label className={s.field}><span>Tür</span><select className={s.select} value={type}
                  onChange={(e) => setType(e.target.value as Entry["type"])}>
                  {entryTypes.map((item) => <option key={item}>{item}</option>)}
                </select></label>
                <label className={s.field}><span>Seviye</span><select className={s.select} value={level}
                  onChange={(e) => setLevel(e.target.value as Entry["level"])}>
                  {levels.map((item) => <option key={item}>{item}</option>)}
                </select></label>
              </div>
              <label className={s.field}><span>İngilizce açıklama</span>
                <Input value={definition} onChange={(e) => setDefinition(e.target.value)} /></label>
              <div className={s.formGrid}>
                <label className={s.field}><span>IPA</span><Input value={ipa} onChange={(e) => setIpa(e.target.value)} /></label>
                <label className={s.field}><span>Okunabilir telaffuz</span><Input value={pronunciationReadable} onChange={(e) => setPronunciationReadable(e.target.value)} /></label>
              </div>
            </div>
          </section>
        )}
        <section className={s.detailSection}>
          <h3>Türkçe anlamlar</h3>
          <ul>
            {entry.meanings.map((meaning) => (
              <li key={meaning}>{meaning}</li>
            ))}
          </ul>
          {!entry.meanings.length && <p className={s.muted}>Henüz anlam eklenmedi.</p>}
          <p className={s.definition} lang="en">
            {entry.definition}
          </p>
        </section>
        <section className={s.detailSection}>
          <h3>Örnek cümleler</h3>
          {entry.examples.map((example, i) => (
            <ExampleSentence
              key={example.english}
              example={example}
              index={i}
            />
          ))}
          {!entry.examples.length && <p className={s.muted}>Henüz örnek cümle yok.</p>}
        </section>
        <section className={s.detailSection}>
          <h3>Benzer ifadeler</h3>
          <div className={s.wrap}>
            {entry.similar.map((word) => (
              <Badge key={word}>{word}</Badge>
            ))}
          </div>
          {!entry.similar.length && <p className={s.muted}>Henüz benzer ifade yok.</p>}
        </section>
        <section className={s.detailSection}>
          <h3>Kaynak ve bağlam</h3>
          {entry.sourceSentence && <p lang="en">“{entry.sourceSentence}”</p>}
          <p className={s.caption} style={{ marginTop: "var(--space-2)" }}>
            {entry.sourceType} · {entry.source}
          </p>
        </section>
        <section className={s.detailSection}>
          <h3>Deck ve etiketler</h3>
          <div className={s.wrap}>
            {entry.decks.map((deck) => (
              <Badge key={deck} tone="blue">
                <BookOpen size={11} /> {deck}
              </Badge>
            ))}
          </div>
          <div className={s.wrap} style={{ marginTop: "var(--space-2)" }}>
            {entry.tags.map((tag) => (
              <Badge key={tag}>#{tag}</Badge>
            ))}
          </div>
        </section>
        <section className={s.detailSection}>
          <h3>Kişisel not</h3>
          {editing ? (
            <Textarea
              aria-label="Kişisel not"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ minHeight: 100 }}
            />
          ) : (
            <p className={s.muted}>
              {note || "Bu ifadeyle ilgili kendi notunu ekleyebilirsin."}
            </p>
          )}
        </section>
      </div>
      <footer className={s.drawerFoot}>
        <div>
          <span role="status" className={s.caption}>
            {saved ? "Değişiklikler kaydedildi" : "Kayıt detayı"}
          </span>
          {error && <p role="alert" className={s.danger}>{error}{" "}
            {duplicateId && <ButtonLink href={`/library?entry=${duplicateId}`} size="small" variant="ghost">Mevcut kaydı aç</ButtonLink>}
          </p>}
          {confirmDelete && <p className={s.caption}>Bu kayıt kütüphanenden kaldırılacak.</p>}
        </div>
        <div className={s.row}>
          {onDelete && !editing && (
            confirmDelete ? <>
              <Button variant="ghost" size="small" disabled={busy} onClick={() => setConfirmDelete(false)}>Vazgeç</Button>
              <Button variant="destructive" size="small" disabled={busy} onClick={remove}>{busy ? "Siliniyor..." : "Sil"}</Button>
            </> : <Button variant="ghost" size="small" disabled={busy} onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Sil
            </Button>
          )}
          {editing ? (
            <Button size="small" onClick={save} disabled={busy}>
              <Check size={14} /> {busy ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          ) : !confirmDelete && (
            <Button variant="secondary" size="small" onClick={() => {
              setEditing(true);
              setSaved(false);
              setError("");
            }}><Pencil size={14} /> Düzenle</Button>
          )}
        </div>
      </footer>
    </>
  );
}
