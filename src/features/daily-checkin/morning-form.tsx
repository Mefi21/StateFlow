"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle, Sunrise } from "lucide-react";
import { metricBySlug } from "@/features/metrics/definitions";

const slugs = [
  "energy",
  "anxiety",
  "future_wanting",
  "life_interest",
  "emotional_intensity",
];

export function MorningForm() {
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(slugs.map((slug) => [slug, 5])),
  );
  const [sleepQuality, setSleepQuality] = useState(5);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  async function save() {
    setStatus("saving");
    const response = await fetch("/api/morning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entryDate: new Date().toISOString().slice(0, 10),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        sleepQuality,
        metrics: values,
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
        <p className="eyebrow">Morning Check-in</p>
        <h1>Утро зафиксировано</h1>
        <Link href="/app/dashboard" className="primary-control">
          На главную
        </Link>
      </div>
    );
  const controls = [
    { slug: "sleep_quality", label: "Качество сна", value: sleepQuality },
    ...slugs.map((slug) => ({
      slug,
      label: metricBySlug.get(slug)?.name ?? slug,
      value: values[slug],
    })),
  ];
  return (
    <div className="simple-form-page">
      <header className="snapshot-header">
        <Link href="/app/dashboard">
          <ArrowLeft />
        </Link>
        <div>
          <p>После пробуждения</p>
          <h1>Morning Check-in</h1>
        </div>
        <Sunrise />
      </header>
      <section className="compact-slider-grid">
        {controls.map(({ slug, label, value }) => (
          <div className="compact-slider panel" key={slug}>
            <div>
              <label htmlFor={`morning-${slug}`}>{label}</label>
              <output>{value}</output>
            </div>
            <input
              id={`morning-${slug}`}
              type="range"
              min="0"
              max="10"
              value={value}
              onChange={(event) =>
                slug === "sleep_quality"
                  ? setSleepQuality(Number(event.target.value))
                  : setValues((current) => ({
                      ...current,
                      [slug]: Number(event.target.value),
                    }))
              }
            />
          </div>
        ))}
      </section>
      {status === "error" ? (
        <p className="form-error">Не удалось сохранить.</p>
      ) : null}
      <div className="snapshot-save">
        <button
          className="primary-control"
          disabled={status === "saving"}
          onClick={save}
        >
          {status === "saving" ? <LoaderCircle className="spin" /> : null}
          Сохранить
        </button>
      </div>
    </div>
  );
}
