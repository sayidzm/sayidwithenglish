"use client";

import { Flame, GraduationCap, Layers, Target } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityChart, ActivityHeatmap, ChartCard, Donut, HorizontalBars, StatCard }
  from "@/components/data/visualizations";
import type { Analytics } from "@/lib/analytics/queries";
import s from "./workspace.module.css";

export function Statistics({ analytics }: { analytics: Analytics }) {
  const [period, setPeriod] = useState("current");
  const weekly = period === "current" ? analytics.weekly : analytics.previousWeekly;
  const maxCefr = Math.max(1, ...analytics.cefr.map((item) => item.value));
  const monthlyWeeks = [0, 1, 2, 3].map((week) => ({
    label: `${week + 1}. hafta`,
    value: analytics.monthly.slice(week * 7, week * 7 + 7)
      .reduce((count, day) => count + day.reviews, 0),
  }));
  return (
    <>
      <PageHeader title="İstatistikler"
        description="Her tekrar bir iz bırakır. Öğrenme yolculuğunu takip et."
        actions={<select className={s.select} style={{ width: 136, height: 32 }}
          aria-label="İstatistik dönemi" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option value="current">Bu hafta</option><option value="previous">Önceki hafta</option>
        </select>} />
      <div className={s.stack}>
        <div className={s.kpis}>
          <StatCard label="Toplam Kayıt" value={analytics.total}
            detail={`${analytics.addedToday} kayıt bugün eklendi`} icon={Layers} positive />
          <StatCard label="Öğrenilen" value={analytics.learned}
            detail={`Koleksiyonun %${Math.round(analytics.learned / Math.max(1, analytics.total) * 100)}'i`}
            icon={GraduationCap} />
          <StatCard label="Doğru Oranı" value={`%${analytics.accuracy}`}
            detail="Kaydedilmiş tekrarlarına göre" icon={Target} positive />
          <StatCard label="Streak" value={analytics.streak} suffix="gün"
            detail="Arka arkaya aktif gün" icon={Flame} />
        </div>
        <div className={s.dashboardGrid}>
          <ChartCard title="Haftalık İlerleme"
            subtitle={`${weekly.reduce((count, day) => count + day.reviews, 0)} tekrar · günlük ortalama ${Math.round(weekly.reduce((count, day) => count + day.reviews, 0) / 7)}`}>
            <ActivityChart mode="line" data={weekly} />
            <div className={s.legend}><span><i className={s.dot} />Tamamlanan tekrarlar</span></div>
          </ChartCard>
          <ChartCard title="Öğrenme Durumu" subtitle="Koleksiyonundaki tüm kayıtlar">
            <div className={s.distribution}>
              <Donut value={analytics.learned} total={analytics.total}
                label="öğrenildi" color="var(--primary)" suffix="" />
              <div className={s.distributionLegend}>
                <div><i className={s.dot} />Öğrenilen<strong>{analytics.learned}</strong></div>
                <div><i className={s.dot} style={{ background: "var(--violet)" }} />
                  Öğreniliyor<strong>{analytics.learning}</strong></div>
                <div><i className={s.dot} style={{ background: "var(--text-secondary)" }} />
                  Yeni<strong>{analytics.newCount}</strong></div>
                <div><i className={s.dot} style={{ background: "var(--warning)" }} />
                  Zor<strong>{analytics.difficult}</strong></div>
              </div>
            </div>
            <div className={s.goalFooter}>
              {analytics.total ? `İfadelerin ${Math.round(analytics.learned / analytics.total * 100)}%'i öğrenildi.`
                : "İlk kaydını eklediğinde ilerlemen burada görünecek."}
            </div>
          </ChartCard>
        </div>
        <div className={s.statisticsGrid}>
          <ChartCard title="CEFR Dağılımı" subtitle="Seviyelere göre kayıt sayısı">
            <div className={s.cefrChart} role="img"
              aria-label={`CEFR dağılımı: ${analytics.cefr.map((item) => `${item.label} ${item.value}`).join(", ")}`}>
              {analytics.cefr.map((item) => (
                <div key={item.label} className={s.cefrColumn}>
                  <div className={s.cefrValue}>{item.value}</div>
                  <div className={s.cefrBar} data-highlight={item.label === "B1"}
                    style={{ height: `${item.value / maxCefr * 110}px` }} />
                  <div className={s.cefrLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          </ChartCard>
          <ChartCard title="Kaynak Dağılımı" subtitle="İngilizceyi nerede keşfediyorsun?">
            {analytics.sources.length ? <HorizontalBars data={analytics.sources} unit="%" />
              : <p className={s.caption}>Kaynak verisi henüz yok.</p>}
          </ChartCard>
          <ChartCard title="Kayıt Türleri" subtitle="Kelimeler, kalıplar ve cümleler">
            {analytics.types.length ? <HorizontalBars data={analytics.types} color="var(--violet)" />
              : <p className={s.caption}>Kayıt verisi henüz yok.</p>}
          </ChartCard>
        </div>
        <div className={s.dashboardGrid}>
          <ChartCard title="Öğrenme Aktivitesi" subtitle="Son 12 haftalık etkinliğin"
            action={<span className={s.caption}>Az → Çok</span>}>
            <div style={{ maxWidth: 560 }}><ActivityHeatmap data={analytics.heatmap} /></div>
            <div className={s.goalFooter} style={{ marginTop: 20 }}>
              Son 30 günde {analytics.monthly.reduce((count, day) => count + day.reviews, 0)} tekrar.
            </div>
          </ChartCard>
          <ChartCard title="Aylık Tekrarlar" subtitle="Son dört haftadaki tekrar sayısı">
            <HorizontalBars data={monthlyWeeks} />
          </ChartCard>
        </div>
        <ChartCard title="Zorlandığın Kategoriler" subtitle={`${analytics.difficult} ifade daha fazla pratik bekliyor`}>
          {analytics.difficultCategories.length
            ? <HorizontalBars data={analytics.difficultCategories} color="var(--warning)" />
            : <p className={s.caption}>Henüz zor kategori yok.</p>}
        </ChartCard>
      </div>
    </>
  );
}
