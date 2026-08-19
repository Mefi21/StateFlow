"use client";

import { useState } from "react";
import { CalendarPlus, LoaderCircle, Plus, Timer } from "lucide-react";

export type ContextActivity = {
  id: string;
  category: string;
  startedAt: string;
  durationMinutes: number;
  enjoyment: number | null;
  mastery: number | null;
};
export type ContextEvent = {
  id: string;
  title: string;
  recordedAt: string;
  category: string;
  valence: string;
  intensity: number;
};

export function ContextView({
  initialActivities,
  initialEvents,
  demo = false,
}: {
  initialActivities: ContextActivity[];
  initialEvents: ContextEvent[];
  demo?: boolean;
}) {
  const [activities, setActivities] = useState(initialActivities);
  const [events, setEvents] = useState(initialEvents);
  const [mode, setMode] = useState<"activity" | "event" | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function addActivity(formData: FormData) {
    if (demo) {
      setMessage("Demo доступно только для чтения.");
      return;
    }
    setPending(true);
    const payload = {
      category: String(formData.get("category")),
      startedAt: new Date().toISOString(),
      durationMinutes: Number(formData.get("durationMinutes")),
      difficulty: Number(formData.get("difficulty")),
      enjoyment: Number(formData.get("enjoyment")),
      mastery: Number(formData.get("mastery")),
      note: String(formData.get("note") || "") || undefined,
    };
    const response = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!response.ok) {
      setMessage("Не удалось сохранить активность.");
      return;
    }
    const json = (await response.json()) as { data: { id: string } };
    setActivities((current) => [
      {
        id: json.data.id,
        category: payload.category,
        startedAt: payload.startedAt,
        durationMinutes: payload.durationMinutes,
        enjoyment: payload.enjoyment,
        mastery: payload.mastery,
      },
      ...current,
    ]);
    setMode(null);
  }
  async function addEvent(formData: FormData) {
    if (demo) {
      setMessage("Demo доступно только для чтения.");
      return;
    }
    setPending(true);
    const payload = {
      title: String(formData.get("title")),
      recordedAt: new Date(
        `${String(formData.get("date"))}T12:00:00`,
      ).toISOString(),
      category: String(formData.get("category")),
      valence: String(formData.get("valence")),
      intensity: Number(formData.get("intensity")),
      note: String(formData.get("note") || "") || undefined,
    };
    const response = await fetch("/api/life-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!response.ok) {
      setMessage("Не удалось сохранить событие.");
      return;
    }
    const json = (await response.json()) as { data: { id: string } };
    setEvents((current) => [
      {
        id: json.data.id,
        title: payload.title,
        recordedAt: payload.recordedAt,
        category: payload.category,
        valence: payload.valence,
        intensity: payload.intensity,
      },
      ...current,
    ]);
    setMode(null);
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Что происходит вокруг состояния</p>
          <h1>Контекст</h1>
          <span>Активности и значимые жизненные события.</span>
        </div>
        <div className="header-actions">
          <button
            className="secondary-control"
            onClick={() => setMode("event")}
          >
            <CalendarPlus size={16} />
            Событие
          </button>
          <button
            className="primary-control"
            onClick={() => setMode("activity")}
          >
            <Plus size={16} />
            Активность
          </button>
        </div>
      </header>
      {mode === "activity" ? (
        <form action={addActivity} className="panel inline-create-form">
          <div className="two-fields">
            <label>
              <span>Категория</span>
              <select name="category">
                <option value="work">Работа</option>
                <option value="study">Учёба</option>
                <option value="programming">Программирование</option>
                <option value="personal_project">Личный проект</option>
                <option value="exercise">Спорт</option>
                <option value="walking">Прогулка</option>
                <option value="gaming">Игры</option>
                <option value="social">Общение</option>
              </select>
            </label>
            <label>
              <span>Продолжительность, мин</span>
              <input
                type="number"
                name="durationMinutes"
                min="1"
                max="1440"
                required
              />
            </label>
          </div>
          <div className="three-fields">
            {[
              ["difficulty", "Сложность"],
              ["enjoyment", "Удовольствие"],
              ["mastery", "Mastery"],
            ].map(([name, label]) => (
              <label key={name}>
                <span>{label}, 0–10</span>
                <input
                  type="number"
                  name={name}
                  min="0"
                  max="10"
                  defaultValue="5"
                />
              </label>
            ))}
          </div>
          <label>
            <span>Заметка</span>
            <textarea name="note" rows={2} />
          </label>
          <button className="primary-control" disabled={pending}>
            {pending ? <LoaderCircle className="spin" /> : null}Сохранить
          </button>
        </form>
      ) : null}
      {mode === "event" ? (
        <form action={addEvent} className="panel inline-create-form">
          <label>
            <span>Название события</span>
            <input name="title" required />
          </label>
          <div className="three-fields">
            <label>
              <span>Дата</span>
              <input
                type="date"
                name="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </label>
            <label>
              <span>Категория</span>
              <input name="category" defaultValue="personal" required />
            </label>
            <label>
              <span>Характер</span>
              <select name="valence">
                <option value="positive">Положительный</option>
                <option value="neutral">Нейтральный</option>
                <option value="negative">Отрицательный</option>
                <option value="mixed">Смешанный</option>
              </select>
            </label>
          </div>
          <label>
            <span>Интенсивность, 0–10</span>
            <input
              type="number"
              name="intensity"
              min="0"
              max="10"
              defaultValue="5"
              required
            />
          </label>
          <label>
            <span>Заметка</span>
            <textarea name="note" rows={2} />
          </label>
          <button className="primary-control" disabled={pending}>
            {pending ? <LoaderCircle className="spin" /> : null}Сохранить
          </button>
        </form>
      ) : null}
      {message ? <p className="form-message">{message}</p> : null}
      <section className="context-columns">
        <div>
          <div className="section-heading">
            <div>
              <p>Activity log</p>
              <h2>Последние активности</h2>
            </div>
          </div>
          <div className="panel context-list">
            {activities.map((item) => (
              <article key={item.id}>
                <span className="stat-icon">
                  <Timer />
                </span>
                <div>
                  <strong>{item.category}</strong>
                  <small>
                    {new Date(item.startedAt).toLocaleString("ru-RU", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </small>
                </div>
                <em>{item.durationMinutes} мин</em>
                <span>
                  Enjoyment {item.enjoyment ?? "—"} · Mastery{" "}
                  {item.mastery ?? "—"}
                </span>
              </article>
            ))}
            {!activities.length ? (
              <div className="module-empty">
                <Timer />
                <p>Активностей пока нет.</p>
              </div>
            ) : null}
          </div>
        </div>
        <div>
          <div className="section-heading">
            <div>
              <p>Life events</p>
              <h2>Значимые события</h2>
            </div>
          </div>
          <div className="panel context-list">
            {events.map((item) => (
              <article key={item.id}>
                <span className="stat-icon sand">
                  <CalendarPlus />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>
                    {new Date(item.recordedAt).toLocaleDateString("ru-RU")} ·{" "}
                    {item.category}
                  </small>
                </div>
                <em>{item.valence}</em>
                <span>Интенсивность {item.intensity}/10</span>
              </article>
            ))}
            {!events.length ? (
              <div className="module-empty">
                <CalendarPlus />
                <p>Событий пока нет.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
