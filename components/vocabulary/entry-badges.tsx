import { Badge } from "@/components/ui/badge";
import type { EntryType, Level, LearningStatus } from "@/lib/mock-data";
import s from "@/components/workspace/workspace.module.css";

export function EntryTypeBadge({ type }: { type: EntryType }) {
  return (
    <Badge
      tone={
        type === "Phrasal Verb"
          ? "blue"
          : type === "Sentence"
            ? "violet"
            : "neutral"
      }
      className={s.miniBadge}
    >
      {type}
    </Badge>
  );
}
export function LevelBadge({ level }: { level: Level }) {
  const tones = {
    A1: "neutral",
    A2: "success",
    B1: "blue",
    B2: "violet",
    C1: "warning",
    C2: "danger",
  } as const;
  return (
    <Badge tone={tones[level]} className={s.miniBadge}>
      {level}
    </Badge>
  );
}
export function LearningStatusBadge({ status }: { status: LearningStatus }) {
  return (
    <span className={s.statusBadge} data-status={status}>
      <i className={s.dot} aria-hidden="true" />
      {status}
    </span>
  );
}
