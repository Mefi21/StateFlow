"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle, Star, Trash2 } from "lucide-react";
import { snapshotMetrics } from "@/features/metrics/definitions";

type Props = {
  snapshot: {
    id: string;
    note: string | null;
    isImportant: boolean;
    version: number;
    recordedAt: string;
    metrics: Record<string, number>;
  };
};

export function SnapshotEditForm({ snapshot }: Props) {
  const router = useRouter();
  const [values, setValues] = useState(snapshot.metrics);
  const [note, setNote] = useState(snapshot.note ?? "");
  const [important, setImportant] = useState(snapshot.isImportant);
  const [version, setVersion] = useState(snapshot.version);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "conflict" | "error"
  >("idle");
  async function save() {
    setStatus("saving");
    const response = await fetch(`/api/snapshots/${snapshot.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        version,
        note: note || null,
        isImportant: important,
        metrics: values,
      }),
    });
    if (response.status === 409) {
      setStatus("conflict");
      return;
    }
    if (!response.ok) {
      setStatus("error");
      return;
    }
    const json = (await response.json()) as { data: { version: number } };
    setVersion(json.data.version);
    setStatus("saved");
  }
  async function remove() {
    if (!window.confirm("Удалить этот snapshot?")) return;
    const response = await fetch(`/api/snapshots/${snapshot.id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      router.push("/app/history");
      router.refresh();
    } else setStatus("error");
  }
  return (
    <div className="snapshot-page">
      <header className="snapshot-header">
        <Link href="/app/timeline">
          <ArrowLeft />
        </Link>
        <div>
          <p>{new Date(snapshot.recordedAt).toLocaleString("ru-RU")}</p>
          <h1>Редактировать snapshot</h1>
        </div>
        <button
          className={important ? "important active" : "important"}
          onClick={() => setImportant((value) => !value)}
        >
          <Star size={17} fill={important ? "currentColor" : "none"} />
          Важный момент
        </button>
      </header>
      <section className="slider-list">
        {snapshotMetrics.map((metric) => (
          <div className="metric-slider" key={metric.slug}>
            <div className="slider-heading">
              <div>
                <label htmlFor={`edit-${metric.slug}`}>{metric.name}</label>
              </div>
              <output>{values[metric.slug] ?? 5}</output>
            </div>
            <input
              id={`edit-${metric.slug}`}
              type="range"
              min="0"
              max="10"
              value={values[metric.slug] ?? 5}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  [metric.slug]: Number(event.target.value),
                }))
              }
            />
          </div>
        ))}
      </section>
      <section className="snapshot-note">
        <label htmlFor="edit-note">Заметка</label>
        <textarea
          id="edit-note"
          maxLength={500}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </section>
      {status === "conflict" ? (
        <p className="form-error">
          Запись изменилась в другой сессии. Обновите страницу и сравните
          версии.
        </p>
      ) : status === "error" ? (
        <p className="form-error">Не удалось сохранить.</p>
      ) : status === "saved" ? (
        <p className="form-message">Изменения сохранены.</p>
      ) : null}
      <div className="edit-actions">
        <button className="danger-control" onClick={remove}>
          <Trash2 size={16} />
          Удалить
        </button>
        <button
          className="primary-control"
          onClick={save}
          disabled={status === "saving"}
        >
          {status === "saving" ? (
            <LoaderCircle className="spin" size={17} />
          ) : null}
          Сохранить
        </button>
      </div>
    </div>
  );
}
