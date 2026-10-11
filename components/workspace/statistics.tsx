"use client";

import { Flame, GraduationCap, Layers, Target } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
  ActivityChart,
  ActivityHeatmap,
  ChartCard,
  Donut,
  HorizontalBars,
  StatCard,
} from "@/components/data/visualizations";
import { usePrototype } from "./prototype-provider";
import {
  cefrDistribution,
  difficultCategories,
  mockEntries,
  overview,
  sourceDistribution,
  weeklyActivity,
  previousWeeklyActivity,
  typeDistribution,
} from "@/lib/mock-data";
import s from "./workspace.module.css";

export function Statistics() {
  const { entries } = usePrototype();
  const [period, setPeriod] = useState("current");
  const total = overview.total + entries.length - mockEntries.length;
  return (
    <>
      <PageHeader
        title="İstatistikler"
        description="Her tekrar bir iz bırakır. Öğrenme yolculuğunu takip et."
        actions={
          <select
            className={s.select}
            style={{ width: 136, height: 32 }}
            aria-label="İstatistik dönemi"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="current">Bu hafta</option>
            <option value="previous">Önceki hafta</option>
          </select>
        }
      />
      <div className={s.stack}>
        <div className={s.kpis}>
          <StatCard
            label="Toplam Kayıt"
            value={total}
            detail="Bu hafta +45 kayıt"
            icon={Layers}
            positive
          />
          <StatCard
            label="Öğrenilen"
            value={overview.learned}
            detail="Koleksiyonunun %64'ü"
            icon={GraduationCap}
          />
          <StatCard
            label="Doğru Oranı"
            value={`%${overview.accuracy}`}
            detail="Geçen haftaya göre +%4"
            icon={Target}
            positive
          />
          <StatCard
            label="Streak"
            value={overview.streak}
            suffix="gün"
            detail="En uzun seri: 18 gün"
            icon={Flame}
          />
        </div>
        <div className={s.dashboardGrid}>
          <ChartCard
            title="Haftalık İlerleme"
            subtitle={
              period === "current"
                ? "154 tekrar · Günlük ortalama 22"
                : "119 tekrar · Günlük ortalama 17"
            }
          >
            <ActivityChart
              mode="line"
              data={
                period === "current" ? weeklyActivity : previousWeeklyActivity
              }
            />
            <div className={s.legend}>
              <span>
                <i className={s.dot} />
                Tamamlanan tekrarlar
              </span>
              <span>
                Önceki haftaya göre <strong className={s.success}>+%29</strong>
              </span>
            </div>
          </ChartCard>
          <ChartCard
            title="Öğrenme Durumu"
            subtitle="Koleksiyonundaki tüm kayıtlar"
          >
            <div className={s.distribution}>
              <Donut
                value={overview.learned}
                total={total}
                label="öğrenildi"
                color="var(--primary)"
                suffix=""
              />
              <div className={s.distributionLegend}>
                <div>
                  <i className={s.dot} />
                  Öğrenilen<strong>218</strong>
                </div>
                <div>
                  <i
                    className={s.dot}
                    style={{ background: "var(--violet)" }}
                  />
                  Öğreniliyor<strong>88</strong>
                </div>
                <div>
                  <i
                    className={s.dot}
                    style={{ background: "var(--text-secondary)" }}
                  />
                  Yeni<strong>18</strong>
                </div>
                <div>
                  <i
                    className={s.dot}
                    style={{ background: "var(--warning)" }}
                  />
                  Zor<strong>18</strong>
                </div>
              </div>
            </div>
            <div className={s.goalFooter}>
              İfadelerin %64&apos;ünü güvenle hatırlıyorsun.
            </div>
          </ChartCard>
        </div>
        <div className={s.statisticsGrid}>
          <ChartCard
            title="CEFR Dağılımı"
            subtitle="Seviyelere göre kayıt sayısı"
          >
            <div
              className={s.cefrChart}
              role="img"
              aria-label="CEFR dağılımı: A1 32, A2 68, B1 142, B2 78, C1 18, C2 4"
            >
              {cefrDistribution.map((item) => (
                <div key={item.label} className={s.cefrColumn}>
                  <div className={s.cefrValue}>{item.value}</div>
                  <div
                    className={s.cefrBar}
                    data-highlight={item.label === "B1"}
                    style={{ height: `${(item.value / 142) * 110}px` }}
                  />
                  <div className={s.cefrLabel}>{item.label}</div>
                </div>
              ))}
            </div>
          </ChartCard>
          <ChartCard
            title="Kaynak Dağılımı"
            subtitle="İngilizceyi nerede keşfediyorsun?"
          >
            <HorizontalBars data={sourceDistribution} unit="%" />
          </ChartCard>
          <ChartCard
            title="Kayıt Türleri"
            subtitle="Kelimeler, kalıplar ve cümleler"
          >
            <HorizontalBars data={typeDistribution} color="var(--violet)" />
          </ChartCard>
        </div>
        <div className={s.dashboardGrid}>
          <ChartCard
            title="Öğrenme Aktivitesi"
            subtitle="Son 12 hafta · 67 aktif gün"
            action={<span className={s.caption}>Az → Çok</span>}
          >
            <div style={{ maxWidth: 560 }}>
              <ActivityHeatmap />
            </div>
            <div className={s.heatmapAxis}>
              <span className={s.caption}>Temmuz</span>
              <span className={s.caption}>Ekim</span>
            </div>
            <div className={s.goalFooter} style={{ marginTop: 20 }}>
              Düzenli çalışma, en güçlü alışkanlığın. Son 7 günün tamamında
              aktiftin.
            </div>
          </ChartCard>
          <ChartCard
            title="Zorlandığın Kategoriler"
            subtitle="18 ifade daha fazla pratik bekliyor"
          >
            <HorizontalBars data={difficultCategories} color="var(--warning)" />
          </ChartCard>
        </div>
      </div>
    </>
  );
}
