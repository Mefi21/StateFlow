import Link from "next/link";
import {
  ArrowDownRight,
  ArrowUpRight,
  BatteryMedium,
  BedDouble,
  Coffee,
  Plus,
  Sparkles,
} from "lucide-react";
import { MetricTrendChart } from "@/components/charts/metric-trend-chart";
import type { DemoDay } from "@/features/demo/data";
import { compareWeeks } from "@/features/demo/data";
import { mean } from "@/lib/statistics";

type MetricKey =
  | "futureWanting"
  | "pleasure"
  | "energy"
  | "anxiety"
  | "sleepHours"
  | "mastery";
const cards: Array<{ key: MetricKey; label: string; color: string }> = [
  { key: "futureWanting", label: "Хочу своего будущего", color: "#45684f" },
  { key: "pleasure", label: "Удовольствие", color: "#8a6f42" },
  { key: "energy", label: "Энергия", color: "#63778a" },
  { key: "anxiety", label: "Тревога", color: "#8d625f" },
  { key: "sleepHours", label: "Сон", color: "#6f658e" },
  { key: "mastery", label: "Ощущение прогресса", color: "#4f7571" },
];

export function DashboardView({
  days,
  demo = false,
}: {
  days: DemoDay[];
  demo?: boolean;
}) {
  const today = days.at(-1)!;
  const previous = days.at(-2)!;
  const prefix = demo ? "/demo" : "/app";
  const insightPeriod = days.slice(-90);
  const restedDays = insightPeriod.filter((day) => day.sleepHours >= 7);
  const shorterSleepDays = insightPeriod.filter((day) => day.sleepHours < 7);
  const sleepDifference =
    (mean(restedDays.map((day) => day.futureWanting)) ?? 0) -
    (mean(shorterSleepDays.map((day) => day.futureWanting)) ?? 0);
  return (
    <>
      <header className="page-heading dashboard-heading">
        <div>
          <p>Вторник, 18 августа</p>
          <h1>Добрый вечер</h1>
        </div>
        <Link
          href={`${prefix}/snapshot${demo ? "" : "s/new"}`}
          className="primary-control desktop-add"
        >
          <Plus size={17} />
          Зафиксировать состояние
        </Link>
      </header>

      <section className="dashboard-top-grid">
        <article className="current-state-panel panel">
          <div className="panel-heading">
            <div>
              <p>Текущее состояние</p>
              <h2>Сегодня, 18:04</h2>
            </div>
            <span className="soft-pill">прогулка · музыка</span>
          </div>
          <div className="current-metrics">
            {[
              [
                "Хочу будущего",
                today.futureWanting,
                today.futureWanting - previous.futureWanting,
              ],
              [
                "Удовольствие",
                today.pleasure,
                today.pleasure - previous.pleasure,
              ],
              ["Энергия", today.energy, today.energy - previous.energy],
              ["Тревога", today.anxiety, today.anxiety - previous.anxiety],
              [
                "Активация",
                today.activation,
                today.activation - previous.activation,
              ],
            ].map(([label, value, delta]) => (
              <div key={String(label)}>
                <span>{label}</span>
                <strong>{Number(value).toFixed(1)}</strong>
                <small
                  className={Number(delta) >= 0 ? "delta-up" : "delta-down"}
                >
                  {Number(delta) >= 0 ? "+" : ""}
                  {Number(delta).toFixed(1)}
                </small>
              </div>
            ))}
          </div>
          <p className="state-note">
            «Закончил задачу, вышел пройтись и слушаю любимый альбом»
          </p>
          <Link
            className="state-change-link"
            href={`${prefix}/snapshot${demo ? "" : "s/new"}`}
          >
            <Sparkles size={15} />
            Состояние изменилось <span>→</span>
          </Link>
        </article>

        <article className="today-panel panel">
          <div className="panel-heading">
            <div>
              <p>Контекст</p>
              <h2>Сегодня</h2>
            </div>
            <span className="quiet-label">{today.snapshots} снимка</span>
          </div>
          <div className="context-stat">
            <span className="stat-icon lavender">
              <BedDouble size={18} />
            </span>
            <span>
              <small>Прошлой ночью</small>
              <strong>{today.sleepHours.toFixed(1)} ч</strong>
            </span>
            <em>цель 7 ч</em>
          </div>
          <div className="context-stat">
            <span className="stat-icon sand">
              <Coffee size={18} />
            </span>
            <span>
              <small>Кофеин</small>
              <strong>{today.caffeineMg} мг</strong>
            </span>
            <em>последний 14:20</em>
          </div>
          <div className="context-stat">
            <span className="stat-icon sage">
              <BatteryMedium size={18} />
            </span>
            <span>
              <small>Активность</small>
              <strong>{Math.round(today.workMinutes / 60)} ч работы</strong>
            </span>
            <em>{today.walkingMinutes} мин ходьбы</em>
          </div>
          <Link className="secondary-action" href={`${prefix}/check-in`}>
            Daily Check-in <span>→</span>
          </Link>
        </article>
      </section>

      <div className="section-heading">
        <div>
          <p>Динамика</p>
          <h2>Последние 7 дней</h2>
        </div>
        <Link href={`${prefix}/analytics`}>Подробная аналитика →</Link>
      </div>
      <section className="trend-grid">
        {cards.map(({ key, label, color }) => {
          const comparison = compareWeeks(key, days);
          const deltaUp = comparison.delta >= 0;
          return (
            <article className="trend-panel panel" key={key}>
              <div className="trend-title">
                <span>{label}</span>
                <small>7 дней</small>
              </div>
              <div className="trend-value">
                <strong>{comparison.current.toFixed(1)}</strong>
                <span className={deltaUp ? "delta-up" : "delta-down"}>
                  {deltaUp ? (
                    <ArrowUpRight size={13} />
                  ) : (
                    <ArrowDownRight size={13} />
                  )}
                  {Math.abs(comparison.delta).toFixed(1)}
                </span>
              </div>
              <MetricTrendChart
                data={days
                  .slice(-14)
                  .map((day) => ({ date: day.date.slice(5), value: day[key] }))}
                color={color}
                label={label}
              />
              <p>Предыдущие 7 дней: {comparison.previous.toFixed(1)}</p>
            </article>
          );
        })}
      </section>

      <aside className="insight-strip">
        <span>
          <Sparkles size={18} />
        </span>
        <div>
          <small>Наблюдение · 90 дней</small>
          <p>
            После сна ≥ 7 часов показатель «Хочу своего будущего» в среднем был
            на {sleepDifference.toFixed(1)} выше, чем в остальных наблюдениях.
          </p>
          <em>N = {restedDays.length} · связь не доказывает причинность</em>
        </div>
        <Link href={`${prefix}/analytics`}>Подробнее →</Link>
      </aside>
    </>
  );
}
