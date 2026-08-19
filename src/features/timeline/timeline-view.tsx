"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  BedDouble,
  Coffee,
  Goal,
  MapPin,
  Moon,
  Pill,
  Star,
} from "lucide-react";

export type TimelineItem = {
  id: string;
  timestamp: string;
  type: "snapshot" | "sleep" | "caffeine" | "event" | "medication" | "goal";
  title: string;
  detail?: string;
  metrics?: Array<{ label: string; value: number }>;
  important?: boolean;
  href?: string;
};
const icons = {
  snapshot: Activity,
  sleep: BedDouble,
  caffeine: Coffee,
  event: MapPin,
  medication: Pill,
  goal: Goal,
};

export function TimelineView({ items }: { items: TimelineItem[] }) {
  const [filter, setFilter] = useState<"all" | "snapshot" | "context">("all");
  const visibleItems = items.filter(
    (item) =>
      filter === "all" ||
      (filter === "snapshot"
        ? item.type === "snapshot"
        : item.type !== "snapshot"),
  );
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Что происходило вокруг изменений</p>
          <h1>Хронология</h1>
          <span>
            Состояния, сон, события, кофеин и изменения контекста в одном
            потоке.
          </span>
        </div>
        <div className="timeline-filters">
          <button
            className={filter === "all" ? "selected" : ""}
            onClick={() => setFilter("all")}
          >
            Всё
          </button>
          <button
            className={filter === "snapshot" ? "selected" : ""}
            onClick={() => setFilter("snapshot")}
          >
            Состояние
          </button>
          <button
            className={filter === "context" ? "selected" : ""}
            onClick={() => setFilter("context")}
          >
            Контекст
          </button>
        </div>
      </header>
      <section className="timeline-list">
        {visibleItems.map((item, index) => {
          const Icon = icons[item.type];
          const date = new Date(item.timestamp);
          return (
            <article className="timeline-item" key={item.id}>
              <div className="timeline-time">
                <strong>
                  {date.toLocaleTimeString("ru-RU", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
                <span>
                  {date.toLocaleDateString("ru-RU", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <div className={`timeline-dot ${item.type}`}>
                <Icon size={16} />
              </div>
              <div className="panel timeline-card">
                <div>
                  <span>
                    {item.type === "snapshot"
                      ? "Snapshot"
                      : item.type === "sleep"
                        ? "Сон"
                        : item.type === "caffeine"
                          ? "Кофеин"
                          : item.type === "medication"
                            ? "Медикамент"
                            : item.type === "goal"
                              ? "Цель"
                              : "Событие"}
                  </span>
                  {item.important ? (
                    <Star size={14} fill="currentColor" />
                  ) : null}
                </div>
                <h2>{item.title}</h2>
                {item.detail ? <p>{item.detail}</p> : null}
                {item.metrics?.length ? (
                  <div className="timeline-metrics">
                    {item.metrics.map((metric) => (
                      <span key={metric.label}>
                        {metric.label}
                        <strong>{metric.value.toFixed(1)}</strong>
                      </span>
                    ))}
                  </div>
                ) : null}
                {item.href ? (
                  <Link href={item.href} className="timeline-edit-link">
                    Редактировать →
                  </Link>
                ) : null}
              </div>
              {index < visibleItems.length - 1 ? (
                <i className="timeline-line" />
              ) : null}
            </article>
          );
        })}
        {!items.length ? (
          <div className="panel module-empty">
            <Moon />
            <h2>Хронология пока пуста</h2>
            <p>Здесь появятся ваши snapshots и контекстные записи.</p>
          </div>
        ) : null}
      </section>
    </>
  );
}
