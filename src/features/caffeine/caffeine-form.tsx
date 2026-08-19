"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, LoaderCircle } from "lucide-react";

const presets = [
  { type: "espresso", name: "Эспрессо", mg: 65 },
  { type: "coffee", name: "Кофе", mg: 110 },
  { type: "energy_drink", name: "Энергетик", mg: 160 },
  { type: "black_tea", name: "Чёрный чай", mg: 45 },
  { type: "green_tea", name: "Зелёный чай", mg: 30 },
] as const;

export function CaffeineForm() {
  const [type, setType] = useState<(typeof presets)[number]["type"] | "custom">(
    "coffee",
  );
  const [mg, setMg] = useState(110);
  const [amount, setAmount] = useState("1 чашка");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  async function save() {
    setStatus("saving");
    const response = await fetch("/api/caffeine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordedAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        beverageType: type,
        caffeineMg: mg,
        amount,
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
        <p className="eyebrow">Кофеин</p>
        <h1>{mg} мг добавлено</h1>
        <p>Время записи сохранено для анализа связи со сном и состоянием.</p>
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
          <h1>Добавить кофеин</h1>
        </div>
      </header>
      <section className="panel record-form">
        <div className="preset-grid">
          {presets.map((preset) => (
            <button
              key={preset.type}
              className={type === preset.type ? "selected" : ""}
              onClick={() => {
                setType(preset.type);
                setMg(preset.mg);
              }}
            >
              {preset.name}
              <small>≈ {preset.mg} мг</small>
            </button>
          ))}
        </div>
        <label>
          <span>Количество кофеина, мг</span>
          <input
            type="number"
            min="0"
            max="2000"
            value={mg}
            onChange={(event) => {
              setMg(Number(event.target.value));
              setType("custom");
            }}
          />
        </label>
        <label>
          <span>Объём / количество</span>
          <input
            value={amount}
            maxLength={100}
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>
        {status === "error" ? (
          <p className="form-error">Не удалось сохранить запись.</p>
        ) : null}
        <button
          className="primary-control"
          disabled={status === "saving"}
          onClick={save}
        >
          {status === "saving" ? (
            <LoaderCircle className="spin" size={17} />
          ) : null}
          Сохранить
        </button>
      </section>
    </div>
  );
}
