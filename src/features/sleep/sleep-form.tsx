"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";

function localInput(date: Date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

export function SleepForm() {
  const defaults = useMemo(() => {
    const woke = new Date();
    woke.setHours(7, 30, 0, 0);
    const started = new Date(woke);
    started.setDate(started.getDate() - 1);
    started.setHours(23, 45, 0, 0);
    return { started: localInput(started), woke: localInput(woke) };
  }, []);
  const [started, setStarted] = useState(defaults.started);
  const [woke, setWoke] = useState(defaults.woke);
  const [quality, setQuality] = useState(6);
  const [awakenings, setAwakenings] = useState(0);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const duration = Math.max(
    0,
    (new Date(woke).getTime() - new Date(started).getTime()) / 3_600_000,
  );

  async function save() {
    setStatus("saving");
    const response = await fetch("/api/sleep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sleepDate: woke.slice(0, 10),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sleepStartedAt: new Date(started).toISOString(),
        wokeUpAt: new Date(woke).toISOString(),
        awakeningsCount: awakenings,
        subjectiveSleepQuality: quality,
        note: note || undefined,
      }),
    });
    setStatus(response.ok ? "saved" : "error");
  }
  if (status === "saved")
    return (
      <div className="snapshot-complete">
        <span className="save-symbol">
          <Check />
        </span>
        <p className="eyebrow">Сон</p>
        <h1>Запись сохранена</h1>
        <p>
          Продолжительность: {duration.toFixed(1)} ч. Это фактическое значение,
          без медицинской интерпретации.
        </p>
        <Link href="/app/dashboard" className="primary-control">
          На главную
        </Link>
      </div>
    );
  return (
    <div className="simple-form-page">
      <header className="snapshot-header">
        <Link href="/app/dashboard">
          <ArrowLeft />
        </Link>
        <div>
          <p>Контекст состояния</p>
          <h1>Запись сна</h1>
        </div>
      </header>
      <section className="panel record-form">
        <div className="calculated-value">
          <span>Продолжительность</span>
          <strong>{duration.toFixed(1)} ч</strong>
          <small>цель 7.0 ч</small>
        </div>
        <div className="two-fields">
          <label>
            <span>Заснул(а)</span>
            <input
              type="datetime-local"
              value={started}
              onChange={(event) => setStarted(event.target.value)}
            />
          </label>
          <label>
            <span>Проснулся(ась)</span>
            <input
              type="datetime-local"
              value={woke}
              onChange={(event) => setWoke(event.target.value)}
            />
          </label>
        </div>
        <label>
          <span>Пробуждения</span>
          <input
            type="number"
            min="0"
            max="100"
            value={awakenings}
            onChange={(event) => setAwakenings(Number(event.target.value))}
          />
        </label>
        <div className="form-range">
          <label htmlFor="sleep-quality">
            Субъективное качество <output>{quality}</output>
          </label>
          <input
            id="sleep-quality"
            type="range"
            min="0"
            max="10"
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
          />
        </div>
        <label>
          <span>
            Заметка <small>необязательно</small>
          </span>
          <textarea
            rows={3}
            maxLength={2000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {status === "error" ? (
          <p className="form-error">
            Не удалось сохранить. Проверьте значения.
          </p>
        ) : null}
        <button
          className="primary-control"
          disabled={status === "saving" || duration <= 0}
          onClick={save}
        >
          {status === "saving" ? (
            <LoaderCircle className="spin" size={17} />
          ) : null}
          Сохранить сон
        </button>
      </section>
    </div>
  );
}
