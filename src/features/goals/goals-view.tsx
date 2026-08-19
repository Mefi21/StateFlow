"use client";

import { useState } from "react";
import { Calendar, LoaderCircle, Plus, Target } from "lucide-react";

export type GoalCard = {
  id: string;
  title: string;
  whyItMatters: string | null;
  category: string;
  progress: number;
  targetDate: string | null;
  wanting?: number;
  mastery?: number;
  confidence?: number;
};

export function GoalsView({
  initialGoals,
  demo = false,
}: {
  initialGoals: GoalCard[];
  demo?: boolean;
}) {
  const [items, setItems] = useState(initialGoals);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [measurementGoal, setMeasurementGoal] = useState<string | null>(null);
  const [measurement, setMeasurement] = useState({
    wanting: 5,
    excitement: 5,
    confidence: 5,
    mastery: 5,
    effortWillingness: 5,
  });
  async function submit(formData: FormData) {
    if (demo) {
      setMessage("Demo доступно только для чтения.");
      return;
    }
    setPending(true);
    setMessage(null);
    const payload = {
      title: String(formData.get("title")),
      whyItMatters: String(formData.get("whyItMatters") || "") || undefined,
      startedAt: new Date().toISOString().slice(0, 10),
      targetDate: String(formData.get("targetDate") || "") || undefined,
      status: "active",
      progress: 0,
      category: String(formData.get("category") || "personal"),
    };
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!response.ok) {
      setMessage("Не удалось создать цель.");
      return;
    }
    const json = (await response.json()) as { data: { id: string } };
    setItems((current) => [
      ...current,
      {
        id: json.data.id,
        title: payload.title,
        whyItMatters: payload.whyItMatters ?? null,
        category: payload.category,
        progress: 0,
        targetDate: payload.targetDate ?? null,
      },
    ]);
    setOpen(false);
  }
  async function saveMeasurement(goalId: string) {
    setPending(true);
    setMessage(null);
    const response = await fetch(`/api/goals/${goalId}/measurements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recordedAt: new Date().toISOString(),
        ...measurement,
      }),
    });
    setPending(false);
    if (!response.ok) {
      setMessage("Не удалось сохранить состояние цели.");
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === goalId
          ? {
              ...item,
              wanting: measurement.wanting,
              mastery: measurement.mastery,
              confidence: measurement.confidence,
            }
          : item,
      ),
    );
    setMeasurementGoal(null);
    setMessage("Состояние цели сохранено.");
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Направление и усилие</p>
          <h1>Цели и проекты</h1>
          <span>
            Отслеживайте не только прогресс, но и то, как меняется желание
            двигаться к цели.
          </span>
        </div>
        <button
          className="primary-control"
          onClick={() => setOpen((value) => !value)}
        >
          <Plus size={17} />
          Новая цель
        </button>
      </header>
      {open ? (
        <form action={submit} className="panel inline-create-form">
          <label>
            <span>Название</span>
            <input name="title" required maxLength={160} />
          </label>
          <label>
            <span>Почему это важно</span>
            <textarea name="whyItMatters" rows={2} maxLength={4000} />
          </label>
          <div className="two-fields">
            <label>
              <span>Категория</span>
              <select name="category">
                <option value="development">Развитие</option>
                <option value="health">Здоровье</option>
                <option value="personal">Личное</option>
                <option value="work">Работа</option>
              </select>
            </label>
            <label>
              <span>Целевая дата</span>
              <input type="date" name="targetDate" />
            </label>
          </div>
          <button className="primary-control" disabled={pending}>
            {pending ? <LoaderCircle className="spin" size={17} /> : null}
            Создать
          </button>
        </form>
      ) : null}
      {message ? (
        <p className="form-message" role="status">
          {message}
        </p>
      ) : null}
      <section className="goal-grid">
        {items.map((goal) => (
          <article className="panel goal-card" key={goal.id}>
            <div className="goal-card-top">
              <span>
                <Target size={18} />
              </span>
              <em>{goal.category}</em>
            </div>
            <h2>{goal.title}</h2>
            <p>{goal.whyItMatters || "Причина пока не добавлена"}</p>
            <div className="progress-track">
              <i style={{ width: `${goal.progress}%` }} />
            </div>
            <div className="goal-card-bottom">
              <strong>{goal.progress}%</strong>
              <span>
                <Calendar size={13} />
                {goal.targetDate ?? "без срока"}
              </span>
            </div>
            <div className="goal-measures">
              <div>
                <span>Wanting</span>
                <strong>{goal.wanting?.toFixed(1) ?? "—"}</strong>
              </div>
              <div>
                <span>Mastery</span>
                <strong>{goal.mastery?.toFixed(1) ?? "—"}</strong>
              </div>
              <div>
                <span>Уверенность</span>
                <strong>{goal.confidence?.toFixed(1) ?? "—"}</strong>
              </div>
            </div>
            {demo ? null : (
              <button
                className="secondary-control goal-measure-button"
                onClick={() =>
                  setMeasurementGoal((current) =>
                    current === goal.id ? null : goal.id,
                  )
                }
              >
                Зафиксировать состояние цели
              </button>
            )}
            {measurementGoal === goal.id ? (
              <div className="goal-measure-form">
                {(
                  [
                    ["wanting", "Wanting"],
                    ["excitement", "Предвкушение"],
                    ["confidence", "Уверенность"],
                    ["mastery", "Mastery"],
                    ["effortWillingness", "Готовность к усилию"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    <span>
                      {label} <strong>{measurement[key]}</strong>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={measurement[key]}
                      onChange={(event) =>
                        setMeasurement((current) => ({
                          ...current,
                          [key]: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                ))}
                <button
                  className="primary-control"
                  onClick={() => saveMeasurement(goal.id)}
                  disabled={pending}
                >
                  Сохранить измерение
                </button>
              </div>
            ) : null}
          </article>
        ))}
        {!items.length ? (
          <div className="panel module-empty">
            <Target />
            <h2>Цели ещё не добавлены</h2>
            <p>
              Создайте цель, чтобы наблюдать wanting, excitement, confidence,
              mastery и готовность к усилию.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
