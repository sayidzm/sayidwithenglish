import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Crown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import s from "@/components/workspace/workspace.module.css";

export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(s.panel, className)}>
      <div className={s.panelHead}>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={s.panelBody}>{children}</div>
    </section>
  );
}
export function StatCard({
  label,
  value,
  suffix,
  detail,
  icon: Icon,
  positive = false,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  detail: string;
  icon: LucideIcon;
  positive?: boolean;
}) {
  return (
    <section className={cn(s.panel, s.stat)} aria-label={label}>
      <div className={s.statLabel}>
        <span>{label}</span>
        <Icon aria-hidden="true" />
      </div>
      <div className={s.statValue}>
        {value}
        {suffix && <small>{suffix}</small>}
      </div>
      <div className={s.statFoot}>
        {positive && (
          <TrendingUp size={12} className={s.success} aria-hidden="true" />
        )}
        <span className={positive ? s.success : undefined}>{detail}</span>
      </div>
    </section>
  );
}
export function ActivityChart({
  mode = "bars",
  data,
}: {
  mode?: "bars" | "line";
  data: { day: string; reviews: number; learned: number }[];
}) {
  const scale = Math.max(1, ...data.map((point) => Math.max(point.reviews, point.learned)));
  const points = data
    .map((d, i) => `${20 + i * 80},${132 - d.reviews / scale * 120}`)
    .join(" ");
  return (
    <div
      className={s.activityChart}
      role="img"
      aria-label={`Haftalık ${mode === "bars" ? "aktivite" : "ilerleme"}: ${data.map((d) => `${d.day} ${d.reviews} tekrar`).join(", ")}`}
    >
      <div className={s.chartY} aria-hidden="true">
        {[40, 30, 20, 10, 0].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className={s.chartPlot}>
        <div className={s.chartGrid} aria-hidden="true">
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} />
          ))}
        </div>
        {mode === "line" ? (
          <svg
            viewBox="0 0 520 132"
            preserveAspectRatio="none"
            className={s.lineSvg}
            aria-hidden="true"
          >
            <polygon
              points={`20,132 ${points} 500,132`}
              fill="var(--primary-soft)"
            />
            <polyline
              points={points}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />
            {data.map((d, i) => (
              <circle
                key={d.day}
                cx={20 + i * 80}
                cy={132 - d.reviews / scale * 120}
                r="3"
                fill="var(--primary)"
              >
                <title>{`${d.day}: ${d.reviews} tekrar`}</title>
              </circle>
            ))}
          </svg>
        ) : (
          <div className={s.chartBars}>
            {data.map((d) => (
              <div
                className={s.barGroup}
                key={d.day}
                title={`${d.day}: ${d.reviews} tekrar, ${d.learned} yeni öğrenilen`}
              >
                <div
                  className={s.chartBar}
                  style={{ height: `${(d.reviews / scale) * 100}%` }}
                />
                <div
                  className={s.chartNewBar}
                  style={{ height: `${(d.learned / scale) * 100}%` }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
      <div className={s.chartDays} aria-hidden="true">
        {data.map((d) => (
          <span key={d.day}>{d.day}</span>
        ))}
      </div>
    </div>
  );
}
export function Donut({
  value,
  total,
  label,
  color = "var(--success)",
  suffix,
}: {
  value: number;
  total: number;
  label: string;
  color?: string;
  suffix?: string;
}) {
  const progress = Math.min(1, Math.max(0, value / Math.max(1, total)));
  return (
    <div className={s.donut}>
      <svg
        viewBox="0 0 144 144"
        role="img"
        aria-label={`${label}: ${value} / ${total}`}
      >
        <circle
          cx="72"
          cy="72"
          r="60"
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth="10"
        />
        <circle
          cx="72"
          cy="72"
          r="60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${progress * 377} 377`}
          strokeLinecap="round"
        />
      </svg>
      <div className={s.donutCenter}>
        <strong>
          {value}
          {suffix ?? `/${total}`}
        </strong>
        <small>{label}</small>
      </div>
    </div>
  );
}
export function DailyGoalCard({
  goal, completed, good, hard, again,
}: {
  goal: number; completed: number; good: number; hard: number; again: number;
}) {
  return (
    <ChartCard
      title="Günlük Hedef"
      action={<Crown size={18} className={s.warning} aria-hidden="true" />}
    >
      <div className={s.goal}>
        <Donut
          value={completed}
          total={goal}
          label="tekrar tamamlandı"
        />
        <div className={s.goalLegend}>
          <div>
            <i className={s.dot} style={{ background: "var(--success)" }} />
            İyi / kolay<strong>{good}</strong>
          </div>
          <div>
            <i className={s.dot} style={{ background: "var(--warning)" }} />
            Zor<strong>{hard}</strong>
          </div>
          <div>
            <i className={s.dot} style={{ background: "var(--danger)" }} />
            Tekrar<strong>{again}</strong>
          </div>
        </div>
      </div>
      <p className={s.goalFooter}>
        {goal > completed
          ? `${goal - completed} tekrar daha, bugünkü hedefin tamam!`
          : "Bugünkü hedefin tamamlandı. Harika ilerliyorsun!"}
      </p>
    </ChartCard>
  );
}
export function ActivityHeatmap({ data }: { data: number[] }) {
  return (
    <div
      role="img"
      aria-label={`Son 12 hafta: ${data.filter(Boolean).length} aktif çalışma günü`}
      className={s.heatmap}
    >
      {data.map((level, i) => (
        <span key={i} data-level={level} className={s.heatCell} />
      ))}
    </div>
  );
}
export function HorizontalBars({
  data,
  color = "var(--primary)",
  unit = "",
}: {
  data: { label: string; value: number }[];
  color?: string;
  unit?: string;
}) {
  const max =
    unit === "%" ? 100 : Math.max(...data.map((item) => item.value), 1);
  return (
    <div className={s.horizontalBars}>
      {data.map((item) => (
        <div key={item.label}>
          <div className={s.barLabel}>
            <span>{item.label}</span>
            <strong>
              {item.value}
              {unit}
            </strong>
          </div>
          <div
            className={s.barTrack}
            role="meter"
            aria-label={item.label}
            aria-valuenow={item.value}
            aria-valuemin={0}
            aria-valuemax={max}
          >
            <div
              className={s.barFill}
              style={{
                width: `${(item.value / max) * 100}%`,
                background: color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
