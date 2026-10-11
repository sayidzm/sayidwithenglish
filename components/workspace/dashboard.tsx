"use client";

import {
  ArrowRight,
  CalendarDays,
  Flame,
  Layers,
  Plus,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import {
  ActivityChart,
  ActivityHeatmap,
  ChartCard,
  DailyGoalCard,
  StatCard,
} from "@/components/data/visualizations";
import { EntryTypeBadge } from "@/components/vocabulary/entry-badges";
import { EntryDetailDrawer } from "@/components/vocabulary/entry-detail-drawer";
import { usePrototype } from "./prototype-provider";
import { overview, mockEntries, previousWeeklyActivity } from "@/lib/mock-data";
import s from "./workspace.module.css";

export function Dashboard() {
  const { entries, settings } = usePrototype();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState("7");
  const added = entries.length - mockEntries.length;
  const difficult = entries.filter((e) => e.status === "Zor");
  const remaining = Math.max(0, settings.reviewGoal - overview.reviews);
  return (
    <>
      <PageHeader
        title="Ana Sayfa"
        description="Bugünkü ilerlemene göz at. Küçük tekrarlar, kalıcı öğrenme."
        actions={
          <div className={s.wrap}>
            <span className={s.caption}>
              <CalendarDays
                size={14}
                style={{ display: "inline", marginRight: 8 }}
              />
              11 Ekim 2026, Pazar
            </span>
            <ButtonLink href="/review" variant="secondary" size="small">
              Devam et
              <ArrowRight size={14} />
            </ButtonLink>
          </div>
        }
      />
      <div className={s.stack}>
        <div className={s.kpis}>
          <StatCard
            label="Bugünkü Tekrarlar"
            value={overview.reviews}
            suffix={`/ ${settings.reviewGoal}`}
            detail={`Günlük hedefin %${Math.min(100, Math.round((overview.reviews / settings.reviewGoal) * 100))} tamamlandı`}
            icon={RotateCcw}
            positive
          />
          <StatCard
            label="Bugün Eklenenler"
            value={overview.added + added}
            detail="Düne göre +3 yeni ifade"
            icon={Plus}
            positive
          />
          <StatCard
            label="Toplam Kayıt"
            value={overview.total + added}
            detail="Kelimeler, ifadeler ve cümleler"
            icon={Layers}
          />
          <StatCard
            label="Zor Öğeler"
            value={overview.difficult}
            detail="Biraz daha pratiğe ihtiyaç var"
            icon={Zap}
          />
        </div>
        <div className={`${s.dashboardGrid} ${s.dashboardActivity}`}>
          <ChartCard
            title="Haftalık Aktivite"
            subtitle={
              period === "7"
                ? "Bu hafta 154 tekrar · 45 yeni öğrenilen"
                : "Önceki hafta 119 tekrar · 35 yeni öğrenilen"
            }
            action={
              <select
                className={s.select}
                style={{ width: 116, height: 32 }}
                aria-label="Aktivite dönemi"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="7">Son 7 gün</option>
                <option value="previous">Önceki hafta</option>
              </select>
            }
          >
            <ActivityChart
              data={period === "7" ? undefined : previousWeeklyActivity}
            />
            <div className={s.legend}>
              <span>
                <i className={s.dot} />
                Tekrar
              </span>
              <span>
                <i
                  className={s.dot}
                  style={{
                    background:
                      "color-mix(in srgb, var(--primary) 30%, var(--surface-1))",
                  }}
                />
                Yeni öğrenilen
              </span>
            </div>
          </ChartCard>
          <DailyGoalCard goal={settings.reviewGoal} />
        </div>
        <div className={`${s.dashboardGrid} ${s.dashboardEntries}`}>
          <section className={s.panel}>
            <div className={s.panelHead}>
              <div>
                <h2>Son Eklenenler</h2>
                <p>Kendi hayatından, kendi İngilizcen.</p>
              </div>
              <ButtonLink href="/library" variant="ghost" size="small">
                Tümünü gör
                <ArrowRight size={14} />
              </ButtonLink>
            </div>
            <div className={s.recentList}>
              {entries.slice(0, 5).map((entry, i) => (
                <button
                  className={s.recentRow}
                  key={entry.id}
                  onClick={() => setSelectedId(entry.id)}
                >
                  <span className={s.rowNumber}>{i + 1}</span>
                  <span className={s.expression}>{entry.expression}</span>
                  <EntryTypeBadge type={entry.type} />
                  <span className={`${s.muted} ${s.recentMeaning}`}>
                    {entry.meanings[0]}
                  </span>
                  <span className={`${s.caption} ${s.recentDate}`}>
                    {i < 3 ? `${i + 1} saat önce` : "Dün"}
                  </span>
                </button>
              ))}
            </div>
          </section>
          <ChartCard
            title="Zorlandıklarım"
            subtitle="Bir sonraki tekrarda bunlara odaklan."
          >
            {difficult
              .concat(entries.filter((e) => e.id === "apparently"))
              .slice(0, 3)
              .map((entry) => (
                <div className={s.difficultItem} key={entry.id}>
                  <div>
                    <button
                      className={s.entryOpen}
                      onClick={() => setSelectedId(entry.id)}
                    >
                      {entry.expression}
                    </button>
                    <p>{entry.meanings[0]}</p>
                  </div>
                  <span className={s.caption}>
                    {entry.id === "work-out" ? "%54" : "%62"}
                  </span>
                </div>
              ))}
            <ButtonLink
              variant="secondary"
              size="small"
              href="/review"
              style={{ width: "100%", marginTop: 16 }}
            >
              <RotateCcw size={14} />
              Bu ifadeleri tekrar et
            </ButtonLink>
          </ChartCard>
        </div>
        <div className={`${s.continue} ${s.dashboardContinue}`}>
          <div className={s.row}>
            <span className={s.avatar}>
              <Flame size={18} />
            </span>
            <div>
              <h2>12 gündür ritmini koruyorsun</h2>
              <p>
                {remaining
                  ? `Hedefine sadece ${remaining} tekrar kaldı. Kaldığın yerden devam et.`
                  : "Bugünkü hedefine ulaştın. İstersen pratiğe devam et."}
              </p>
            </div>
          </div>
          <ButtonLink href="/review" size="small">
            Tekrara devam
            <ArrowRight size={14} />
          </ButtonLink>
        </div>
        <div className={`${s.spread} ${s.dashboardHeatmap}`}>
          <span className={s.caption}>Son 12 haftalık öğrenme aktiviten</span>
          <div style={{ width: 220 }}>
            <ActivityHeatmap />
          </div>
        </div>
      </div>
      <EntryDetailDrawer
        entry={entries.find((e) => e.id === selectedId) ?? null}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
