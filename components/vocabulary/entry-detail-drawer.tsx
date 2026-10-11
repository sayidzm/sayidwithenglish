"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { BookOpen, Check, Pencil, Volume2, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Textarea } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { usePrototype } from "@/components/workspace/prototype-provider";
import {
  EntryTypeBadge,
  LevelBadge,
  LearningStatusBadge,
} from "./entry-badges";
import type { Entry, Example } from "@/lib/mock-data";
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
}: {
  entry: Entry | null;
  onClose: () => void;
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
          {entry && <EntryDetail key={entry.id} entry={entry} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function EntryDetail({ entry }: { entry: Entry }) {
  const { updateEntry } = usePrototype();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(entry.note);
  const [expression, setExpression] = useState(entry.expression);
  const [saved, setSaved] = useState(false);
  function save() {
    updateEntry({
      ...entry,
      expression: expression.trim() || entry.expression,
      note,
    });
    setEditing(false);
    setSaved(true);
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
      </header>
      <div className={s.drawerBody}>
        {editing && (
          <label className={s.field}>
            <span className={s.fieldLabel}>İfade</span>
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
            />
          </label>
        )}
        <section className={s.detailSection}>
          <h3>Türkçe anlamlar</h3>
          <ul>
            {entry.meanings.map((meaning) => (
              <li key={meaning}>{meaning}</li>
            ))}
          </ul>
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
        </section>
        <section className={s.detailSection}>
          <h3>Benzer ifadeler</h3>
          <div className={s.wrap}>
            {entry.similar.map((word) => (
              <Badge key={word}>{word}</Badge>
            ))}
          </div>
        </section>
        <section className={s.detailSection}>
          <h3>Kaynak ve bağlam</h3>
          <p lang="en">“{entry.sourceSentence}”</p>
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
        <span role="status" className={s.caption}>
          {saved ? "Değişiklikler kaydedildi" : "Günlük İngilizce koleksiyonu"}
        </span>
        {editing ? (
          <Button size="small" onClick={save}>
            <Check size={14} />
            Kaydet
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              setEditing(true);
              setSaved(false);
            }}
          >
            <Pencil size={14} />
            Düzenle
          </Button>
        )}
      </footer>
    </>
  );
}
