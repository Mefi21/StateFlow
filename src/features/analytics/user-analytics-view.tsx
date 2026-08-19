import { MetricTrendChart } from "@/components/charts/metric-trend-chart";
import { metricBySlug } from "@/features/metrics/definitions";
import type { DashboardData } from "@/features/dashboard/queries";
import { mean, median, standardDeviation } from "@/lib/statistics";

const slugs = [
  "future_wanting",
  "current_pleasure",
  "energy",
  "anxiety",
  "activation",
  "mastery",
];

export function UserAnalyticsView({ data }: { data: DashboardData }) {
  if (!data.dailySeries.length)
    return (
      <div className="module-empty panel analytics-empty">
        <h1>Для аналитики нужны данные</h1>
        <p>
          Добавьте snapshots и daily check-ins. Корреляции появятся только после
          N ≥ 14, а personal baseline — после 21 дня.
        </p>
      </div>
    );
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Нейтральная статистика</p>
          <h1>Аналитика</h1>
          <span>Рассчитано только из ваших записей.</span>
        </div>
      </header>
      <section className="trend-grid">
        {slugs.map((slug) => {
          const points = data.dailySeries.flatMap((day) =>
            day.metrics[slug] === undefined
              ? []
              : [{ date: day.date.slice(5), value: day.metrics[slug] }],
          );
          if (!points.length) return null;
          const values = points.map((point) => point.value);
          return (
            <article className="panel trend-panel" key={slug}>
              <div className="trend-title">
                <span>{metricBySlug.get(slug)?.name}</span>
                <small>N = {values.length}</small>
              </div>
              <div className="stat-line">
                <span>
                  Среднее <b>{mean(values)?.toFixed(1)}</b>
                </span>
                <span>
                  Медиана <b>{median(values)?.toFixed(1)}</b>
                </span>
                <span>
                  SD <b>{standardDeviation(values)?.toFixed(1)}</b>
                </span>
              </div>
              <MetricTrendChart
                data={points}
                label={metricBySlug.get(slug)?.name}
              />
              <p>
                {values.length < 14
                  ? "Небольшая выборка — выводы пока ненадёжны."
                  : "Дневная агрегация: Daily Check-in, иначе медиана snapshots."}
              </p>
            </article>
          );
        })}
      </section>
      <p className="boundary-note">
        Корреляция не доказывает причинность. StateFlow не делает медицинских
        выводов.
      </p>
    </>
  );
}
