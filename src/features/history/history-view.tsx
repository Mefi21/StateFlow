"use client";

import { useMemo, useState } from "react";
import {
  BedDouble,
  CalendarDays,
  Coffee,
  Footprints,
  Star,
} from "lucide-react";

export type HistoryDay = {
  date: string;
  metrics: Record<string, number>;
  snapshots: number;
  sleepHours?: number;
  caffeineMg?: number;
  note?: string;
};
const options = [
  { slug: "future_wanting", label: "Хочу своего будущего" },
  { slug: "current_pleasure", label: "Удовольствие" },
  { slug: "energy", label: "Энергия" },
  { slug: "anxiety", label: "Тревога" },
  { slug: "escape_urge", label: "Эскапизм" },
  { slug: "activation", label: "Активация" },
  { slug: "death_thoughts", label: "Мысли о смерти" },
];

export function HistoryView({
  days,
  demo = false,
}: {
  days: HistoryDay[];
  demo?: boolean;
}) {
  const [metric, setMetric] = useState("future_wanting");
  const [selectedDate, setSelectedDate] = useState(days.at(-1)?.date ?? "");
  const [month, setMonth] = useState(
    days.at(-1)?.date.slice(0, 7) ?? new Date().toISOString().slice(0, 7),
  );
  const visible = useMemo(
    () => days.filter((day) => day.date.startsWith(month)),
    [days, month],
  );
  const selected = days.find((day) => day.date === selectedDate);
  const blanks = useMemo(
    () =>
      visible.length
        ? (new Date(`${visible[0].date}T12:00:00Z`).getUTCDay() + 6) % 7
        : 0,
    [visible],
  );
  const monthTitle = new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T12:00:00Z`));
  const earliestMonth = days.at(0)?.date.slice(0, 7) ?? month;
  const latestMonth = days.at(-1)?.date.slice(0, 7) ?? month;
  function moveMonth(offset: number) {
    const date = new Date(`${month}-01T12:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + offset);
    const next = date.toISOString().slice(0, 7);
    setMonth(next);
    const matches = days.filter((day) => day.date.startsWith(next));
    setSelectedDate(matches.at(-1)?.date ?? "");
  }
  return (
    <>
      <header className="page-heading history-heading">
        <div>
          <p>Дневной обзор</p>
          <h1>История</h1>
          <span>Цвет показывает выбранную метрику, а не общую оценку дня.</span>
        </div>
        <label className="metric-select">
          <span>Цвет календаря</span>
          <select
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
          >
            {options.map((option) => (
              <option value={option.slug} key={option.slug}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>
      <section className="history-layout">
        <div className="panel calendar-panel">
          <div className="calendar-title">
            <button
              aria-label="Предыдущий месяц"
              onClick={() => moveMonth(-1)}
              disabled={month <= earliestMonth}
            >
              ←
            </button>
            <h2>{monthTitle}</h2>
            <button
              aria-label="Следующий месяц"
              onClick={() => moveMonth(1)}
              disabled={month >= latestMonth}
            >
              →
            </button>
          </div>
          <div className="calendar-weekdays">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="calendar-grid">
            {Array.from({ length: blanks }, (_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {visible.map((day) => {
              const value = day.metrics[metric];
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={selectedDate === day.date ? "selected" : ""}
                  style={
                    {
                      "--level": value === undefined ? 0 : value / 10,
                    } as React.CSSProperties
                  }
                >
                  <span>{Number(day.date.slice(-2))}</span>
                  {value === undefined ? (
                    <small>—</small>
                  ) : (
                    <strong>{value.toFixed(1)}</strong>
                  )}
                  <i>
                    {Array.from(
                      { length: Math.min(day.snapshots, 4) },
                      (_, index) => (
                        <b key={index} />
                      ),
                    )}
                  </i>
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>Ниже</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((level) => (
              <i
                key={level}
                style={{ "--level": level } as React.CSSProperties}
              />
            ))}
            <span>Выше</span>
            <em>• число точек = snapshots</em>
          </div>
        </div>
        <aside className="panel day-detail">
          {selected ? (
            <>
              <div className="day-detail-heading">
                <div>
                  <p>{selected.date}</p>
                  <h2>Детали дня</h2>
                </div>
                {demo ? <Star size={18} /> : null}
              </div>
              <div className="day-metric-list">
                {options.slice(0, 6).map((option) =>
                  selected.metrics[option.slug] === undefined ? null : (
                    <div key={option.slug}>
                      <span>{option.label}</span>
                      <strong>
                        {selected.metrics[option.slug].toFixed(1)}
                      </strong>
                      <i
                        style={{
                          width: `${selected.metrics[option.slug] * 10}%`,
                        }}
                      />
                    </div>
                  ),
                )}
              </div>
              <div className="day-context-grid">
                {selected.sleepHours !== undefined ? (
                  <div>
                    <BedDouble />
                    <span>
                      Сон<strong>{selected.sleepHours.toFixed(1)} ч</strong>
                    </span>
                  </div>
                ) : null}
                {selected.caffeineMg !== undefined ? (
                  <div>
                    <Coffee />
                    <span>
                      Кофеин<strong>{selected.caffeineMg} мг</strong>
                    </span>
                  </div>
                ) : null}
                <div>
                  <CalendarDays />
                  <span>
                    Снимки<strong>{selected.snapshots}</strong>
                  </span>
                </div>
                {demo ? (
                  <div>
                    <Footprints />
                    <span>
                      Прогулка<strong>42 мин</strong>
                    </span>
                  </div>
                ) : null}
              </div>
              {selected.note ? (
                <blockquote>«{selected.note}»</blockquote>
              ) : null}
            </>
          ) : (
            <div className="module-empty">
              <CalendarDays />
              <h2>Выберите день</h2>
            </div>
          )}
        </aside>
      </section>
      <p className="history-footnote">
        Дневное значение: Daily Check-in, если он есть; иначе медиана snapshots.
      </p>
    </>
  );
}
