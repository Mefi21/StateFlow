import { MultiMetricChart } from "@/components/charts/multi-metric-chart";
import type { DemoDay } from "@/features/demo/data";
import { mean } from "@/lib/statistics";
import { PrintButton } from "./print-button";

export function ReportView({
  days,
  demo = false,
}: {
  days: DemoDay[];
  demo?: boolean;
}) {
  const month = days.slice(-30);
  const previous = days.slice(-60, -30);
  const lastDate = new Date(`${days.at(-1)?.date ?? "2026-08-18"}T12:00:00Z`);
  const monthLabel = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "UTC",
  }).format(lastDate);
  const previousDate = new Date(lastDate);
  previousDate.setUTCMonth(previousDate.getUTCMonth() - 1);
  const previousMonthLabel = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    timeZone: "UTC",
  }).format(previousDate);
  const rested = month.filter((day) => day.sleepHours >= 7);
  const shorterSleep = month.filter((day) => day.sleepHours < 7);
  const sleepDifference =
    (mean(rested.map((day) => day.futureWanting)) ?? 0) -
    (mean(shorterSleep.map((day) => day.futureWanting)) ?? 0);
  const programming = month.filter((day) => day.programmingMinutes > 0);
  const noProgramming = month.filter((day) => day.programmingMinutes === 0);
  const programmingDifference =
    (mean(programming.map((day) => day.mastery)) ?? 0) -
    (mean(noProgramming.map((day) => day.mastery)) ?? 0);
  const row = (label: string, key: keyof DemoDay, unit = "") => {
    const current = mean(month.map((day) => Number(day[key]))) ?? 0;
    const before = mean(previous.map((day) => Number(day[key]))) ?? 0;
    return (
      <tr>
        <th>{label}</th>
        <td>
          {current.toFixed(1)}
          {unit}
        </td>
        <td>
          {before.toFixed(1)}
          {unit}
        </td>
        <td>
          {current - before >= 0 ? "+" : ""}
          {(current - before).toFixed(1)}
        </td>
      </tr>
    );
  };
  return (
    <article className="report-sheet">
      <header>
        <div>
          <span className="mark">S</span>
          <div>
            <strong>StateFlow</strong>
            <small>Monthly report</small>
          </div>
        </div>
        <PrintButton />
      </header>
      <div className="report-title">
        <p>
          Последние {month.length} дней · до {days.at(-1)?.date}
        </p>
        <h1>Ежемесячный обзор</h1>
        <span>
          {demo ? "Synthetic demo profile" : "Личный отчёт"} · наблюдательные
          данные
        </span>
      </div>
      <section>
        <h2>Ключевые показатели</h2>
        <table>
          <thead>
            <tr>
              <th>Метрика</th>
              <th>{monthLabel}</th>
              <th>{previousMonthLabel}</th>
              <th>Δ</th>
            </tr>
          </thead>
          <tbody>
            {row("Хочу своего будущего", "futureWanting")}
            {row("Удовольствие", "pleasure")}
            {row("Энергия", "energy")}
            {row("Mastery", "mastery")}
            {row("Тревога", "anxiety")}
            {row("Сон", "sleepHours", " ч")}
          </tbody>
        </table>
      </section>
      <section>
        <h2>Динамика состояния</h2>
        <MultiMetricChart
          data={month.map((day) => ({
            date: day.date.slice(5),
            futureWanting: day.futureWanting,
            pleasure: day.pleasure,
            mastery: day.mastery,
          }))}
          series={[
            { key: "futureWanting", label: "Wanting" },
            { key: "pleasure", label: "Pleasure" },
            { key: "mastery", label: "Mastery" },
          ]}
        />
      </section>
      <section className="report-insights">
        <h2>Описательные наблюдения</h2>
        <div>
          <p>
            После сна ≥ 7 часов Future Wanting в среднем отличался на{" "}
            {sleepDifference.toFixed(1)}.
          </p>
          <small>
            N = {rested.length} дней · связь не доказывает причинность
          </small>
        </div>
        <div>
          <p>
            В дни с программированием Mastery в среднем отличался на{" "}
            {programmingDifference.toFixed(1)}.
          </p>
          <small>
            N = {programming.length} дней · возможны смешивающие факторы
          </small>
        </div>
      </section>
      <footer>
        StateFlow не является медицинским сервисом и не ставит диагнозы.
        Результаты основаны на субъективных наблюдениях.
      </footer>
    </article>
  );
}
