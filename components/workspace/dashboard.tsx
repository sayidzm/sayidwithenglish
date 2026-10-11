"use client";

import { ArrowRight, CalendarDays, Flame, Layers, Plus, RotateCcw, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { ActivityChart, ActivityHeatmap, ChartCard, DailyGoalCard, StatCard }
  from "@/components/data/visualizations";
import { EntryTypeBadge } from "@/components/vocabulary/entry-badges";
import type { Analytics } from "@/lib/analytics/queries";
import type { Entry } from "@/lib/mock-data";
import s from "./workspace.module.css";

export function Dashboard({ analytics, entries }: { analytics: Analytics; entries: Entry[] }) {
  const [period, setPeriod] = useState("7");
  const remaining = Math.max(0, analytics.reviewGoal - analytics.todayReviews);
  const difficult = entries.filter((entry) => analytics.difficultEntryIds.includes(entry.id));
  return (
    <>
      <PageHeader title="Ana Sayfa"
        description="Bugünkü ilerlemene göz at. Küçük tekrarlar, kalıcı öğrenme."
        actions={<div className={s.wrap}>
          <span className={s.caption}>
            <CalendarDays size={14} style={{ display: "inline", marginRight: 8 }} />
            {new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          <ButtonLink href="/review" variant="secondary" size="small">Devam et <ArrowRight size={14} /></ButtonLink>
        </div>} />
      <div className={s.stack}>
        <div className={s.kpis}>
          <StatCard label="Bugünkü Tekrarlar" value={analytics.todayReviews}
            suffix={`/ ${analytics.reviewGoal}`}
            detail={`Günlük hedefin %${Math.min(100, Math.round(analytics.todayReviews / analytics.reviewGoal * 100))} tamamlandı`}
            icon={RotateCcw} positive />
          <StatCard label="Bugün Eklenenler" value={analytics.addedToday}
            detail="Bugün koleksiyonuna eklenenler" icon={Plus} positive />
          <StatCard label="Toplam Kayıt" value={analytics.total}
            detail="Kelimeler, ifadeler ve cümleler" icon={Layers} />
          <StatCard label="Zor Öğeler" value={analytics.difficult}
            detail="Biraz daha pratiğe ihtiyaç var" icon={Zap} />
        </div>
        <div className={`${s.dashboardGrid} ${s.dashboardActivity}`}>
          <ChartCard title="Haftalık Aktivite"
            subtitle={period === "7"
              ? `Son 7 günde ${analytics.weekly.reduce((n, day) => n + day.reviews, 0)} tekrar`
              : `Önceki hafta ${analytics.previousWeekly.reduce((n, day) => n + day.reviews, 0)} tekrar`}
            action={<select className={s.select} style={{ width: 116, height: 32 }}
              aria-label="Aktivite dönemi" value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="7">Son 7 gün</option><option value="previous">Önceki hafta</option>
            </select>}>
            <ActivityChart data={period === "7" ? analytics.weekly : analytics.previousWeekly} />
            <div className={s.legend}>
              <span><i className={s.dot} />Tekrar</span>
              <span><i className={s.dot} style={{ background: "color-mix(in srgb, var(--primary) 30%, var(--surface-1))" }} />Yeni eklenen</span>
            </div>
          </ChartCard>
          <DailyGoalCard goal={analytics.reviewGoal} completed={analytics.todayReviews}
            good={analytics.todayGood} hard={analytics.todayHard} again={analytics.todayAgain} />
        </div>
        <div className={`${s.dashboardGrid} ${s.dashboardEntries}`}>
          <section className={s.panel}>
            <div className={s.panelHead}>
              <div><h2>Son Eklenenler</h2><p>Kendi hayatından, kendi İngilizcen.</p></div>
              <ButtonLink href="/library" variant="ghost" size="small">Tümünü gör <ArrowRight size={14} /></ButtonLink>
            </div>
            <div className={s.recentList}>
              {entries.length ? entries.slice(0, 5).map((entry, index) => (
                <Link className={s.recentRow} key={entry.id} href={`/library?entry=${entry.id}`}>
                  <span className={s.rowNumber}>{index + 1}</span>
                  <span className={s.expression}>{entry.expression}</span>
                  <EntryTypeBadge type={entry.type} />
                  <span className={`${s.muted} ${s.recentMeaning}`}>{entry.meanings[0] || "Anlam eklenmedi"}</span>
                  <span className={`${s.caption} ${s.recentDate}`}>{entry.date}</span>
                </Link>
              )) : <p className={s.caption} style={{ padding: 20 }}>
                Henüz kaydın yok. İlk ifadeni ekleyerek başlayabilirsin.
              </p>}
            </div>
          </section>
          <ChartCard title="Zorlandıklarım" subtitle="Bir sonraki tekrarda bunlara odaklan.">
            {difficult.length ? difficult.slice(0, 3).map((entry) => (
              <div className={s.difficultItem} key={entry.id}>
                <div><Link className={s.entryOpen} href={`/library?entry=${entry.id}`}>
                  {entry.expression}</Link><p>{entry.meanings[0] || "Anlam eklenmedi"}</p></div>
                <Zap size={14} className={s.warning} />
              </div>
            )) : <p className={s.caption}>Şu anda zorlandığın kayıt yok.</p>}
            <ButtonLink variant="secondary" size="small" href="/review"
              style={{ width: "100%", marginTop: 16 }}>
              <RotateCcw size={14} />Bu ifadeleri tekrar et</ButtonLink>
          </ChartCard>
        </div>
        <div className={`${s.continue} ${s.dashboardContinue}`}>
          <div className={s.row}>
            <span className={s.avatar}><Flame size={18} /></span>
            <div><h2>{analytics.streak} günlük çalışma serisi</h2>
              <p>{remaining ? `Hedefine ${remaining} tekrar kaldı.` : "Bugünkü hedefine ulaştın."}</p>
            </div>
          </div>
          <ButtonLink href="/review" size="small">Tekrara devam <ArrowRight size={14} /></ButtonLink>
        </div>
        <div className={`${s.spread} ${s.dashboardHeatmap}`}>
          <span className={s.caption}>Son 12 haftalık öğrenme aktiviten</span>
          <div style={{ width: 220 }}><ActivityHeatmap data={analytics.heatmap} /></div>
        </div>
      </div>
    </>
  );
}
