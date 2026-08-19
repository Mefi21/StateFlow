"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { Activity, FlaskConical, Grid3X3, Sparkles, Waves } from "lucide-react";
import { MultiMetricChart } from "@/components/charts/multi-metric-chart";
import { CorrelationScatter } from "@/components/charts/correlation-scatter";
import type { DemoDay } from "@/features/demo/data";
import {
  labilityIndex,
  mean,
  spearmanCorrelation,
  standardDeviation,
} from "@/lib/statistics";

const periods: ReadonlyArray<{ value: number | null; label: string }> = [
  { value: 7, label: "7д" },
  { value: 30, label: "30д" },
  { value: 90, label: "90д" },
  { value: 365, label: "1г" },
  { value: null, label: "Все" },
];

function differenceBetweenGroups(
  days: DemoDay[],
  predicate: (day: DemoDay) => boolean,
  select: (day: DemoDay) => number,
) {
  const matching = days.filter(predicate).map(select);
  const rest = days.filter((day) => !predicate(day)).map(select);
  const difference = (mean(matching) ?? 0) - (mean(rest) ?? 0);
  return { difference, n: matching.length };
}

export function AnalyticsView({
  days,
  demo = false,
}: {
  days: DemoDay[];
  demo?: boolean;
}) {
  const [periodDays, setPeriodDays] = useState<number | null>(90);
  const period = periodDays === null ? days : days.slice(-periodDays);
  const latest7 = period.slice(-7);
  const baseline = days.slice(-37, -7);
  const futureMean = mean(latest7.map((day) => day.futureWanting)) ?? 0;
  const baselineMean = mean(baseline.map((day) => day.futureWanting)) ?? 0;
  const baselineSd =
    standardDeviation(
      baseline.map((day) => day.futureWanting),
      true,
    ) ?? 0;
  const lability =
    labilityIndex(
      period
        .slice(-14)
        .map((day) => [
          day.futureWanting,
          day.pleasure,
          day.energy,
          day.anxiety,
          day.activation,
          day.emotionalIntensity,
        ]),
    ) ?? 0;
  const futureIndex =
    mean(
      latest7.map(
        (day) =>
          0.4 * day.futureWanting +
          0.25 * day.anticipation +
          0.2 * day.goalDrive +
          0.15 * day.mastery,
      ),
    ) ?? 0;
  const previousFutureIndex =
    mean(
      period
        .slice(-14, -7)
        .map(
          (day) =>
            0.4 * day.futureWanting +
            0.25 * day.anticipation +
            0.2 * day.goalDrive +
            0.15 * day.mastery,
        ),
    ) ?? futureIndex;
  const positiveIndex =
    mean(
      latest7.map(
        (day) =>
          0.5 * day.pleasure + 0.25 * day.lifeInterest + 0.25 * day.pride,
      ),
    ) ?? 0;
  const sleepFuture = spearmanCorrelation(
    period.slice(0, -1).map((day) => day.sleepHours),
    period.slice(1).map((day) => day.futureWanting),
  );
  const lagRows = [
    {
      label: "Сон → Wanting",
      values: [0, 1, 2, 3].map(
        (lag) =>
          spearmanCorrelation(
            period
              .slice(0, lag ? -lag : undefined)
              .map((day) => day.sleepHours),
            period.slice(lag).map((day) => day.futureWanting),
          )?.rho ?? null,
      ),
    },
    {
      label: "Кофеин → Активация",
      values: [0, 1, 2, 3].map(
        (lag) =>
          spearmanCorrelation(
            period
              .slice(0, lag ? -lag : undefined)
              .map((day) => day.caffeineMg),
            period.slice(lag).map((day) => day.activation),
          )?.rho ?? null,
      ),
    },
    {
      label: "Mastery → Wanting",
      values: [0, 1, 2, 3].map(
        (lag) =>
          spearmanCorrelation(
            period.slice(0, lag ? -lag : undefined).map((day) => day.mastery),
            period.slice(lag).map((day) => day.futureWanting),
          )?.rho ?? null,
      ),
    },
  ];
  const sleepInsight = differenceBetweenGroups(
    period,
    (day) => day.sleepHours >= 7,
    (day) => day.futureWanting,
  );
  const programmingInsight = differenceBetweenGroups(
    period,
    (day) => day.programmingMinutes > 0,
    (day) => day.mastery,
  );
  const walkingInsight = differenceBetweenGroups(
    period,
    (day) => day.walkingMinutes >= 30,
    (day) => day.pleasure,
  );

  return (
    <>
      <header className="page-heading analytics-heading">
        <div>
          <p>Нейтральная статистика</p>
          <h1>Аналитика</h1>
          <span>
            Связи, изменения и вариабельность без диагностических выводов.
          </span>
        </div>
        <div className="period-switcher">
          {periods.map(({ value, label }) => (
            <button
              key={label}
              className={periodDays === value ? "selected" : ""}
              onClick={() => setPeriodDays(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>
      <section className="analytics-kpis">
        <article className="panel">
          <span className="analytic-icon">
            <Sparkles size={17} />
          </span>
          <div>
            <small>Future Engagement</small>
            <strong>{futureIndex.toFixed(1)}</strong>
            <em>
              {futureIndex - previousFutureIndex >= 0 ? "+" : ""}
              {(futureIndex - previousFutureIndex).toFixed(1)} за 7 дней
            </em>
          </div>
          <p>
            0.40 Wanting + 0.25 Anticipation + 0.20 Goal Drive + 0.15 Mastery
          </p>
        </article>
        <article className="panel">
          <span className="analytic-icon warm">
            <Activity size={17} />
          </span>
          <div>
            <small>Positive Experience</small>
            <strong>{positiveIndex.toFixed(1)}</strong>
            <em>7-дневное среднее</em>
          </div>
          <p>0.50 Pleasure + 0.25 Life Interest + 0.25 Pride</p>
        </article>
        <article className="panel">
          <span className="analytic-icon purple">
            <Waves size={17} />
          </span>
          <div>
            <small>Within-Day Lability</small>
            <strong>{lability.toFixed(1)}</strong>
            <em>из 10</em>
          </div>
          <p>Среднее абсолютное движение между последовательными снимками.</p>
        </article>
      </section>

      <section className="panel analytics-main-chart">
        <div className="panel-heading">
          <div>
            <p>Наложение метрик</p>
            <h2>Wanting, удовольствие и mastery</h2>
          </div>
          <span className="soft-pill">дневная медиана</span>
        </div>
        <MultiMetricChart
          data={period.map((day) => ({
            date: day.date.slice(5),
            futureWanting: day.futureWanting,
            pleasure: day.pleasure,
            mastery: day.mastery,
          }))}
          series={[
            { key: "futureWanting", label: "Хочу будущего" },
            { key: "pleasure", label: "Удовольствие" },
            { key: "mastery", label: "Mastery" },
          ]}
        />
      </section>

      <section className="analytics-two-col">
        <article className="panel baseline-card">
          <div className="panel-heading">
            <div>
              <p>Personal baseline</p>
              <h2>Notable shift</h2>
            </div>
            <span className="analytic-icon">
              <Grid3X3 size={16} />
            </span>
          </div>
          <strong>{(futureMean - baselineMean).toFixed(1)}</strong>
          <p>
            «Хочу своего будущего» за последние 7 дней относительно предыдущего
            30-дневного среднего.
          </p>
          <dl>
            <div>
              <dt>7 дней</dt>
              <dd>{futureMean.toFixed(1)}</dd>
            </div>
            <div>
              <dt>Baseline</dt>
              <dd>{baselineMean.toFixed(1)}</dd>
            </div>
            <div>
              <dt>Стандартное отклонение</dt>
              <dd>{baselineSd.toFixed(1)}</dd>
            </div>
          </dl>
          <small>
            {baselineSd
              ? `${((futureMean - baselineMean) / baselineSd).toFixed(1)} SD от предыдущего baseline`
              : "Недостаточная вариабельность"}
          </small>
        </article>
        <article className="panel correlation-card">
          <div className="panel-heading">
            <div>
              <p>Spearman correlation</p>
              <h2>Сон → Wanting на следующий день</h2>
            </div>
            <span className="soft-pill">N = {sleepFuture?.n ?? 0}</span>
          </div>
          <div className="rho">
            <span>ρ</span>
            <strong>{sleepFuture?.rho.toFixed(2) ?? "—"}</strong>
            <em>
              {(sleepFuture?.n ?? 0) >= 14
                ? "описательная связь"
                : "недостаточная выборка"}
            </em>
          </div>
          <CorrelationScatter
            data={period.slice(0, -1).map((day, index) => ({
              x: day.sleepHours,
              y: period[index + 1].futureWanting,
            }))}
            xLabel="Сон, ч"
            yLabel="Wanting +1 день"
          />
          <p>
            За выбранный период сон статистически сопоставлен с Wanting на
            следующий день. Корреляция не доказывает причинность.
          </p>
        </article>
      </section>

      <section className="panel lag-section">
        <div className="panel-heading">
          <div>
            <p>Lagged correlations</p>
            <h2>Связи со сдвигом во времени</h2>
          </div>
          <FlaskConical size={18} />
        </div>
        <div className="lag-matrix">
          <span />
          <b>Тот же день</b>
          <b>+1 день</b>
          <b>+2 дня</b>
          <b>+3 дня</b>
          {lagRows.map((row) => (
            <Fragment key={row.label}>
              <strong>{row.label}</strong>
              {row.values.map((value, index) => (
                <i
                  key={index}
                  style={
                    {
                      "--strength": Math.abs(value ?? 0),
                    } as React.CSSProperties
                  }
                >
                  {value === null ? "—" : value.toFixed(2)}
                </i>
              ))}
            </Fragment>
          ))}
        </div>
        <small>
          Показывается ρ Спирмена. Для каждой ячейки требуется N ≥ 14.
        </small>
      </section>

      <section className="insights-section">
        <div className="section-heading">
          <div>
            <p>Descriptive insights</p>
            <h2>Что заметно в данных</h2>
          </div>
        </div>
        <div className="insight-grid">
          <article className="panel">
            <span>Сон</span>
            <h3>
              После сна ≥ 7 часов Wanting в среднем отличался на{" "}
              {sleepInsight.difference.toFixed(1)}.
            </h3>
            <p>N = {sleepInsight.n} дней · выбранный период</p>
          </article>
          <article className="panel">
            <span>Программирование</span>
            <h3>
              В дни с программированием Mastery в среднем отличался на{" "}
              {programmingInsight.difference.toFixed(1)}.
            </h3>
            <p>N = {programmingInsight.n} дней · контекстная связь</p>
          </article>
          <article className="panel">
            <span>Прогулки</span>
            <h3>
              В дни с прогулкой ≥ 30 минут Pleasure в среднем отличался на{" "}
              {walkingInsight.difference.toFixed(1)}.
            </h3>
            <p>N = {walkingInsight.n} дней · контекстная связь</p>
          </article>
        </div>
      </section>
      {demo ? (
        <p className="demo-method-note">
          Все значения в demo рассчитаны из детерминированного синтетического
          набора. Они не относятся к реальному человеку.
        </p>
      ) : null}
      <div className="analytics-footer">
        <Link href={demo ? "/demo/reports" : "/app/reports"}>
          Открыть ежемесячный отчёт →
        </Link>
        <span>Наблюдательные данные · не медицинское заключение</span>
      </div>
    </>
  );
}
