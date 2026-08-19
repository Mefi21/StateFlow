import Link from "next/link";
import { BedDouble, Coffee, Plus, Sparkles } from "lucide-react";
import { MetricTrendChart } from "@/components/charts/metric-trend-chart";
import { metricBySlug } from "@/features/metrics/definitions";
import { mean } from "@/lib/statistics";
import type { DashboardData } from "./queries";

const dashboardMetrics = [
  "future_wanting",
  "current_pleasure",
  "energy",
  "anxiety",
  "mastery",
];

export function UserDashboardView({
  data,
  metricSlugs,
}: {
  data: DashboardData;
  metricSlugs?: string[];
}) {
  const activeMetrics = metricSlugs ?? dashboardMetrics;
  if (!data.latest) return <EmptyDashboard />;
  return (
    <>
      <header className="page-heading dashboard-heading">
        <div>
          <p>Ваше пространство</p>
          <h1>Текущее состояние</h1>
        </div>
        <Link href="/app/snapshots/new" className="primary-control desktop-add">
          <Plus size={17} />
          Зафиксировать состояние
        </Link>
      </header>
      <section className="dashboard-top-grid">
        <article className="current-state-panel panel">
          <div className="panel-heading">
            <div>
              <p>Последний снимок</p>
              <h2>
                {data.latest.recordedAt.toLocaleString("ru-RU", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </h2>
            </div>
          </div>
          <div className="current-metrics">
            {activeMetrics.slice(0, 5).map((slug) => {
              const value = data.latestMetrics[slug];
              const before = data.previousMetrics[slug];
              return (
                <div key={slug}>
                  <span>{metricBySlug.get(slug)?.shortName}</span>
                  <strong>
                    {value === undefined ? "—" : value.toFixed(1)}
                  </strong>
                  {value !== undefined && before !== undefined ? (
                    <small>
                      {value - before >= 0 ? "+" : ""}
                      {(value - before).toFixed(1)}
                    </small>
                  ) : null}
                </div>
              );
            })}
          </div>
          {data.latest.note ? (
            <p className="state-note">«{data.latest.note}»</p>
          ) : null}
          <Link className="state-change-link" href="/app/snapshots/new">
            <Sparkles size={15} />
            Состояние изменилось <span>→</span>
          </Link>
        </article>
        <article className="today-panel panel">
          <div className="panel-heading">
            <div>
              <p>Контекст</p>
              <h2>Последние записи</h2>
            </div>
          </div>
          <Link href="/app/sleep" className="context-stat">
            <span className="stat-icon lavender">
              <BedDouble size={18} />
            </span>
            <span>
              <small>Последний сон</small>
              <strong>
                {data.sleep
                  ? `${(data.sleep.sleepDurationMinutes / 60).toFixed(1)} ч`
                  : "Добавить запись"}
              </strong>
            </span>
          </Link>
          <Link href="/app/caffeine" className="context-stat">
            <span className="stat-icon sand">
              <Coffee size={18} />
            </span>
            <span>
              <small>Кофеин за 24 часа</small>
              <strong>{data.caffeineMg} мг · добавить</strong>
            </span>
          </Link>
          <Link className="secondary-action" href="/app/check-in">
            Daily Check-in <span>→</span>
          </Link>
        </article>
      </section>

      <div className="section-heading">
        <div>
          <p>Динамика</p>
          <h2>Данные за 30 дней</h2>
        </div>
        <Link href="/app/analytics">Подробная аналитика →</Link>
      </div>
      <section className="trend-grid">
        {activeMetrics.map((slug) => {
          const points = data.dailySeries.flatMap((day) =>
            day.metrics[slug] === undefined
              ? []
              : [{ date: day.date.slice(5), value: day.metrics[slug] }],
          );
          if (!points.length) return null;
          const last7 = mean(points.slice(-7).map((point) => point.value));
          const previous7 = mean(
            points.slice(-14, -7).map((point) => point.value),
          );
          return (
            <article className="trend-panel panel" key={slug}>
              <div className="trend-title">
                <span>{metricBySlug.get(slug)?.name}</span>
                <small>N = {points.length}</small>
              </div>
              <div className="trend-value">
                <strong>{last7?.toFixed(1) ?? "—"}</strong>
                {last7 !== null && previous7 !== null ? (
                  <span>
                    {last7 - previous7 >= 0 ? "+" : ""}
                    {(last7 - previous7).toFixed(1)}
                  </span>
                ) : null}
              </div>
              <MetricTrendChart
                data={points}
                label={metricBySlug.get(slug)?.shortName}
              />
              <p>Дневная агрегация: медиана snapshots</p>
            </article>
          );
        })}
      </section>
    </>
  );
}

function EmptyDashboard() {
  return (
    <div className="empty-dashboard">
      <span className="empty-mark">
        <Sparkles size={26} />
      </span>
      <p className="eyebrow">Начало наблюдения</p>
      <h1>Первая точка вашей истории</h1>
      <p>
        Зафиксируйте состояние сейчас. Это займёт меньше минуты, а спустя время
        станет частью точной личной картины.
      </p>
      <Link href="/app/snapshots/new" className="primary-control">
        <Plus size={18} />
        Создать первый снимок
      </Link>
      <small>
        Никаких диагнозов — только ваши данные и нейтральная статистика.
      </small>
    </div>
  );
}
