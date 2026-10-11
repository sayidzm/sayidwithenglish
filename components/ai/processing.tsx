import { Check, Circle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/data/visualizations";
import {
  EntryTypeBadge,
  LevelBadge,
} from "@/components/vocabulary/entry-badges";
import { processingStages, type Entry } from "@/lib/mock-data";
import s from "@/components/workspace/workspace.module.css";

export function AIProcessingPanel({
  stage,
  processing,
  unsupported = false,
}: {
  stage: number;
  processing: boolean;
  unsupported?: boolean;
}) {
  return (
    <ChartCard
      title="AI İşleme"
      subtitle={
        unsupported
          ? "Bu ifade için hazır örnek bulunamadı."
          : "Her ifade, öğrenmeye hazır bir kayda dönüşür."
      }
      action={
        <Badge
          tone={
            unsupported
              ? "warning"
              : stage >= processingStages.length
                ? "success"
                : "blue"
          }
        >
          {unsupported
            ? "Örnek gerekli"
            : stage >= processingStages.length
              ? "Tamamlandı"
              : processing
                ? "İşleniyor"
                : "Önizleme"}
        </Badge>
      }
    >
      <ol className={s.processList}>
        {processingStages.map((label, i) => {
          const state = unsupported
            ? "pending"
            : i < stage
              ? "completed"
              : i === stage
                ? "current"
                : "pending";
          return (
            <li key={label} className={s.processItem} data-state={state}>
              <span className={s.processIcon}>
                {state === "completed" ? (
                  <Check />
                ) : state === "current" ? (
                  <Sparkles />
                ) : (
                  <Circle />
                )}
              </span>
              <span>{label}</span>
              <span className={s.processState}>
                {state === "completed"
                  ? "Hazır"
                  : state === "current"
                    ? "İşleniyor"
                    : "Bekliyor"}
              </span>
            </li>
          );
        })}
      </ol>
    </ChartCard>
  );
}
export function AIResultCard({ entry }: { entry: Entry }) {
  return (
    <article className={s.result}>
      <div className={s.spread}>
        <h3>{entry.expression}</h3>
        <LevelBadge level={entry.level} />
      </div>
      <div style={{ marginTop: 8 }}>
        <EntryTypeBadge type={entry.type} />
      </div>
      <p>{entry.meanings.join(" · ")}</p>
      <p className={s.caption}>{entry.definition}</p>
      <div className={s.resultExample}>
        <p lang="en">{entry.examples[0].english}</p>
        <p className={s.caption}>{entry.examples[0].turkish}</p>
      </div>
    </article>
  );
}
