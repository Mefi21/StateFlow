import { MetricTrendChart } from "@/components/charts/metric-trend-chart";
import type { DashboardData } from "@/features/dashboard/queries";
import { metricBySlug } from "@/features/metrics/definitions";
import { mean } from "@/lib/statistics";
import { PrintButton } from "./print-button";

const metrics = [
  "future_wanting",
  "current_pleasure",
  "energy",
  "mastery",
  "anxiety",
  "activation",
];

export function UserReportView({ data }: { data: DashboardData }) {
  return (
    <article className="report-sheet">
      <header>
        <div>
          <span className="mark">S</span>
          <div>
            <strong>StateFlow</strong>
            <small>Personal report</small>
          </div>
        </div>
        <PrintButton />
      </header>
      <div className="report-title">
        <p>Последние 30 дней</p>
        <h1>Персональный обзор</h1>
        <span>Наблюдательные данные · рассчитано из вашего аккаунта</span>
      </div>
      {!data.dailySeries.length ? (
        <div className="module-empty">
          <h2>Данных пока недостаточно</h2>
          <p>Отчёт заполнится после snapshots и daily check-ins.</p>
        </div>
      ) : (
        metrics.map((slug) => {
          const points = data.dailySeries.flatMap((day) =>
            day.metrics[slug] === undefined
              ? []
              : [{ date: day.date.slice(5), value: day.metrics[slug] }],
          );
          if (!points.length) return null;
          return (
            <section key={slug}>
              <h2>
                {metricBySlug.get(slug)?.name} · среднее{" "}
                {mean(points.map((point) => point.value))?.toFixed(1)}
              </h2>
              <MetricTrendChart
                data={points}
                label={metricBySlug.get(slug)?.name}
              />
            </section>
          );
        })
      )}
      <footer>
        StateFlow не является медицинским сервисом. Корреляции и сравнения не
        доказывают причинность.
      </footer>
    </article>
  );
}
