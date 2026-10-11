"use client";

import type { Entry } from "@/lib/mock-data";
import { formatEntryDate } from "@/lib/mock-data";
import {
  EntryTypeBadge,
  LearningStatusBadge,
  LevelBadge,
} from "./entry-badges";
import { cn } from "@/lib/cn";
import s from "@/components/workspace/workspace.module.css";

export function EntryRow({
  entry,
  onSelect,
}: {
  entry: Entry;
  onSelect: (entry: Entry) => void;
}) {
  return (
    <tr className={s.entryRow} onClick={() => onSelect(entry)}>
      <td>
        <button
          className={s.entryOpen}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(entry);
          }}
        >
          {entry.expression}
        </button>
      </td>
      <td className={s.tableType}>
        <EntryTypeBadge type={entry.type} />
      </td>
      <td className={s.tableMeaning}>
        {entry.meanings.slice(0, 2).join(", ")}
      </td>
      <td>
        <LevelBadge level={entry.level} />
      </td>
      <td>
        <LearningStatusBadge status={entry.status} />
      </td>
      <td className={s.tableSource}>{entry.source}</td>
      <td className={cn(s.caption, s.tableDate)}>
        {formatEntryDate(entry.date)}
      </td>
    </tr>
  );
}
export function EntryCard({
  entry,
  onSelect,
}: {
  entry: Entry;
  onSelect: (entry: Entry) => void;
}) {
  return (
    <button className={s.entryCard} onClick={() => onSelect(entry)}>
      <div className={s.spread}>
        <h3>{entry.expression}</h3>
        <LevelBadge level={entry.level} />
      </div>
      <p>{entry.meanings.slice(0, 2).join(", ")}</p>
      <div className={s.spread}>
        <EntryTypeBadge type={entry.type} />
        <LearningStatusBadge status={entry.status} />
      </div>
    </button>
  );
}
export function EntryTable({
  entries,
  onSelect,
}: {
  entries: Entry[];
  onSelect: (entry: Entry) => void;
}) {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">İfade</th>
            <th scope="col" className={s.tableType}>
              Tür
            </th>
            <th scope="col">Türkçe anlamı</th>
            <th scope="col">Seviye</th>
            <th scope="col">Durum</th>
            <th scope="col" className={s.tableSource}>
              Kaynak
            </th>
            <th scope="col" className={s.tableDate}>
              Tarih
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} onSelect={onSelect} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
