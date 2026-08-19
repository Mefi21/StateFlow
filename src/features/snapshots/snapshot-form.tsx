"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CloudOff, LoaderCircle, Star } from "lucide-react";
import { snapshotMetrics } from "@/features/metrics/definitions";
import {
  acknowledgeSnapshot,
  enqueueSnapshot,
} from "@/features/offline-sync/queue";
import type { SnapshotInput } from "@/lib/validation/entries";

const contextTags = [
  "дома",
  "работа",
  "учёба",
  "транспорт",
  "прогулка",
  "спорт",
  "программирование",
  "личный проект",
  "музыка",
  "игра",
  "соцсети",
  "еда",
  "друзья",
  "партнёр",
  "семья",
  "один",
];

type SaveState = "idle" | "saving" | "synced" | "pending" | "demo";

export function SnapshotForm({
  demo = false,
  metricSlugs,
}: {
  demo?: boolean;
  metricSlugs?: string[];
}) {
  const activeMetrics = useMemo(
    () =>
      metricSlugs === undefined
        ? snapshotMetrics
        : metricSlugs.flatMap((slug) => {
            const metric = snapshotMetrics.find((item) => item.slug === slug);
            return metric ? [metric] : [];
          }),
    [metricSlugs],
  );
  const [values, setValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(activeMetrics.map((metric) => [metric.slug, 5])),
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [important, setImportant] = useState(false);
  const [state, setState] = useState<SaveState>("idle");
  const [previous, setPrevious] = useState<Record<string, number> | null>(null);
  const back = demo ? "/demo" : "/app/dashboard";
  const changed = useMemo(
    () =>
      previous
        ? activeMetrics.filter(
            (metric) =>
              previous[metric.slug] !== undefined &&
              previous[metric.slug] !== values[metric.slug],
          )
        : [],
    [activeMetrics, previous, values],
  );

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  }

  function addCustomTag() {
    const tag = customTag.trim().toLocaleLowerCase("ru");
    if (!tag || selectedTags.includes(tag)) return;
    setSelectedTags((current) => [...current, tag].slice(0, 20));
    setCustomTag("");
  }

  async function save() {
    if (demo) {
      setState("demo");
      setPrevious(
        Object.fromEntries(
          Object.entries(values).map(([key, value]) => [
            key,
            Math.max(0, Math.min(10, value + (key === "anxiety" ? 2 : -2))),
          ]),
        ),
      );
      return;
    }
    setState("saving");
    const payload: SnapshotInput = {
      id: crypto.randomUUID(),
      recordedAt: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      note: note || undefined,
      isImportant: important,
      metrics: values,
      tags: selectedTags,
    };
    await enqueueSnapshot(payload);
    try {
      const response = await fetch("/api/sync/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshots: [payload] }),
      });
      if (!response.ok) throw new Error("SYNC_FAILED");
      const result = (await response.json()) as {
        data?: {
          acknowledged?: Array<{ previousMetrics?: Record<string, number> }>;
        };
      };
      await acknowledgeSnapshot(payload.id);
      setPrevious(result.data?.acknowledged?.[0]?.previousMetrics ?? null);
      setState("synced");
    } catch {
      setState("pending");
    }
  }

  if (state === "synced" || state === "pending" || state === "demo") {
    return (
      <div className="snapshot-complete">
        <span className={`save-symbol ${state === "pending" ? "pending" : ""}`}>
          {state === "pending" ? <CloudOff /> : <Check />}
        </span>
        <p className="eyebrow">
          {state === "demo"
            ? "Интерактивное демо"
            : state === "pending"
              ? "Сохранено на устройстве"
              : "Снимок сохранён"}
        </p>
        <h1>
          {state === "pending"
            ? "Отправим при подключении"
            : "Состояние зафиксировано"}
        </h1>
        <p>
          {state === "demo"
            ? "Демо остаётся только для чтения — эта пробная запись не изменила набор данных."
            : state === "pending"
              ? "Запись безопасно ждёт синхронизации и не будет продублирована."
              : "Точная временная точка добавлена в вашу историю."}
        </p>
        {changed.length ? (
          <div className="delta-list">
            {changed.map((metric) => (
              <div key={metric.slug}>
                <span>{metric.shortName}</span>
                <strong>
                  {previous![metric.slug]} → {values[metric.slug]}
                </strong>
                <em>
                  {values[metric.slug] - previous![metric.slug] > 0 ? "+" : ""}
                  {values[metric.slug] - previous![metric.slug]}
                </em>
              </div>
            ))}
          </div>
        ) : null}
        <div className="complete-actions">
          <Link className="primary-control" href={back}>
            Вернуться на главную
          </Link>
          <button
            className="secondary-control"
            onClick={() => {
              setState("idle");
              setPrevious(null);
            }}
          >
            Ещё один снимок
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="snapshot-page">
      <header className="snapshot-header">
        <Link href={back} aria-label="Назад">
          <ArrowLeft />
        </Link>
        <div>
          <p>Quick Snapshot</p>
          <h1>Что вы чувствуете сейчас?</h1>
        </div>
        <button
          type="button"
          className={important ? "important active" : "important"}
          onClick={() => setImportant((value) => !value)}
          aria-pressed={important}
        >
          <Star size={17} fill={important ? "currentColor" : "none"} />
          Важный момент
        </button>
      </header>
      <p className="snapshot-intro">
        Не анализируйте слишком долго — отметьте первое ощущение. Все шкалы
        независимы.
      </p>
      <section className="slider-list">
        {activeMetrics.map((metric) => (
          <div className="metric-slider" key={metric.slug}>
            <div className="slider-heading">
              <div>
                <label htmlFor={metric.slug}>{metric.name}</label>
                <p>{metric.question}</p>
              </div>
              <output htmlFor={metric.slug}>{values[metric.slug]}</output>
            </div>
            <input
              id={metric.slug}
              type="range"
              min="0"
              max="10"
              step="1"
              value={values[metric.slug]}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [metric.slug]: Number(event.target.value),
                }))
              }
            />
            <div className="range-labels">
              <span>{metric.lowLabel}</span>
              <span>{metric.highLabel}</span>
            </div>
          </div>
        ))}
      </section>
      <section className="snapshot-context">
        <div className="form-section-heading">
          <div>
            <h2>Что сейчас происходит?</h2>
            <p>Можно выбрать несколько контекстов</p>
          </div>
        </div>
        <div className="tag-picker">
          {contextTags.map((tag) => (
            <button
              type="button"
              className={selectedTags.includes(tag) ? "selected" : ""}
              onClick={() => toggleTag(tag)}
              key={tag}
            >
              {tag}
            </button>
          ))}
        </div>
        <div className="custom-tag-add">
          <label htmlFor="custom-context-tag">Свой тег</label>
          <input
            id="custom-context-tag"
            value={customTag}
            maxLength={50}
            placeholder="Например, библиотека"
            onChange={(event) => setCustomTag(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustomTag();
              }
            }}
          />
          <button
            type="button"
            className="secondary-control"
            onClick={addCustomTag}
            disabled={!customTag.trim()}
          >
            Добавить тег
          </button>
        </div>
      </section>
      <section className="snapshot-note">
        <label htmlFor="snapshot-note">
          Короткая заметка <span>необязательно</span>
        </label>
        <textarea
          id="snapshot-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          placeholder="Что могло повлиять на состояние?"
        />
        <small>{note.length}/500</small>
      </section>
      <div className="snapshot-save">
        <button
          className="primary-control"
          onClick={save}
          disabled={state === "saving"}
        >
          {state === "saving" ? (
            <LoaderCircle className="spin" size={18} />
          ) : null}
          {state === "saving" ? "Сохраняем…" : "Сохранить снимок"}
        </button>
        <p>Время и часовой пояс добавятся автоматически</p>
      </div>
    </div>
  );
}
