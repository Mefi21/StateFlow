"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, Save } from "lucide-react";
import { coreMetrics } from "@/features/metrics/definitions";

const questions = [
  ["pleasant", "Что сегодня было особенно приятно?"],
  ["difficult", "Что было особенно тяжело?"],
  ["alive", "Что заставило почувствовать себя живым?"],
  ["mastery", "Что дало ощущение достижения?"],
  ["looking_forward", "Чего я сейчас жду?"],
  ["proud", "Чем сегодня горжусь?"],
] as const;

type Draft = {
  values: Record<string, number>;
  answers: Record<string, string>;
  note: string;
};
const draftKey = "stateflow:daily-draft";

export function DailyCheckinForm({
  demo = false,
  metricSlugs,
}: {
  demo?: boolean;
  metricSlugs?: string[];
}) {
  const activeMetrics = useMemo(() => {
    const defaults = coreMetrics.filter((metric) => metric.dailyEnabled);
    if (metricSlugs === undefined) return defaults;
    return metricSlugs.flatMap((slug) => {
      const metric = defaults.find((item) => item.slug === slug);
      return metric ? [metric] : [];
    });
  }, [metricSlugs]);
  const defaults = useMemo(
    () => Object.fromEntries(activeMetrics.map((metric) => [metric.slug, 5])),
    [activeMetrics],
  );
  const [values, setValues] = useState<Record<string, number>>(defaults);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const back = demo ? "/demo" : "/app/dashboard";

  useEffect(() => {
    if (demo) return;
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw) as Draft;
      const timer = window.setTimeout(() => {
        setValues({ ...defaults, ...draft.values });
        setAnswers(draft.answers);
        setNote(draft.note);
      }, 0);
      return () => window.clearTimeout(timer);
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, [defaults, demo]);

  useEffect(() => {
    if (demo || complete) return;
    const timer = window.setTimeout(
      () =>
        localStorage.setItem(
          draftKey,
          JSON.stringify({ values, answers, note } satisfies Draft),
        ),
      500,
    );
    return () => window.clearTimeout(timer);
  }, [values, answers, note, demo, complete]);

  async function save(isDraft: boolean) {
    if (demo) {
      setComplete(true);
      setMessage("Пробная запись не изменила данные demo.");
      return;
    }
    setPending(true);
    setMessage(null);
    const response = await fetch("/api/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryDate: new Date().toISOString().slice(0, 10),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isDraft,
        metrics: values,
        contextualAnswers: answers,
        note: note || undefined,
      }),
    });
    setPending(false);
    if (!response.ok) {
      setMessage("Не удалось сохранить. Черновик остался на устройстве.");
      return;
    }
    if (!isDraft) {
      localStorage.removeItem(draftKey);
      setComplete(true);
    }
    setMessage(isDraft ? "Черновик сохранён." : null);
  }

  if (complete)
    return (
      <div className="snapshot-complete">
        <span className="save-symbol">
          <Check />
        </span>
        <p className="eyebrow">Daily Check-in</p>
        <h1>День зафиксирован</h1>
        <p>{message ?? "Запись и метрики добавлены в историю."}</p>
        <Link href={back} className="primary-control">
          Вернуться на главную
        </Link>
      </div>
    );

  return (
    <div className="checkin-page">
      <header className="snapshot-header">
        <Link href={back} aria-label="Назад">
          <ArrowLeft />
        </Link>
        <div>
          <p>Вечерняя запись</p>
          <h1>Daily Check-in</h1>
        </div>
        <span className="draft-state">
          <Save size={14} />
          Автосохранение
        </span>
      </header>
      <p className="snapshot-intro">
        Оцените день в целом. Snapshot остаётся отдельной точкой текущего
        момента.
      </p>
      <section className="compact-slider-grid">
        {activeMetrics.map((metric) => (
          <div className="compact-slider panel" key={metric.slug}>
            <div>
              <label htmlFor={`daily-${metric.slug}`}>{metric.name}</label>
              <output>{values[metric.slug]}</output>
            </div>
            <input
              id={`daily-${metric.slug}`}
              type="range"
              min="0"
              max="10"
              value={values[metric.slug]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [metric.slug]: Number(event.target.value),
                }))
              }
            />
            <p>
              {metric.lowLabel}
              <span>{metric.highLabel}</span>
            </p>
          </div>
        ))}
      </section>
      <section className="context-questions panel">
        <div className="form-section-heading">
          <div>
            <h2>Контекст дня</h2>
            <p>Необязательные короткие вопросы</p>
          </div>
        </div>
        {questions.map(([key, label]) => (
          <label key={key}>
            <span>{label}</span>
            <textarea
              value={answers[key] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({
                  ...current,
                  [key]: event.target.value,
                }))
              }
              maxLength={1000}
              rows={2}
            />
          </label>
        ))}
        <label>
          <span>Свободная заметка</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={10_000}
            rows={4}
          />
        </label>
      </section>
      {message ? (
        <p className="form-message" role="status">
          {message}
        </p>
      ) : null}
      <div className="checkin-actions">
        <button
          className="secondary-control"
          disabled={pending}
          onClick={() => save(true)}
        >
          Сохранить черновик
        </button>
        <button
          className="primary-control"
          disabled={pending}
          onClick={() => save(false)}
        >
          {pending ? <LoaderCircle className="spin" size={17} /> : null}
          Завершить check-in
        </button>
      </div>
    </div>
  );
}
