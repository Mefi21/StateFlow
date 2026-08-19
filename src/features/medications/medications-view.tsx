"use client";

import { useState } from "react";
import { Activity, LoaderCircle, Plus } from "lucide-react";

export type MedicationCard = {
  id: string;
  name: string;
  genericName: string | null;
  unit: string;
  dose?: number;
  schedule?: string;
  startDate?: string;
};

export function MedicationsView({
  initialItems,
  demo = false,
}: {
  initialItems: MedicationCard[];
  demo?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function submit(formData: FormData) {
    if (demo) {
      setMessage("Demo доступно только для чтения.");
      return;
    }
    setPending(true);
    const payload = {
      name: String(formData.get("name")),
      genericName: String(formData.get("genericName") || "") || undefined,
      unit: String(formData.get("unit")),
      startDate: String(formData.get("startDate")),
      dose: Number(formData.get("dose")),
      schedule: String(formData.get("schedule")),
      note: String(formData.get("note") || "") || undefined,
    };
    const response = await fetch("/api/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setPending(false);
    if (!response.ok) {
      setMessage("Не удалось сохранить.");
      return;
    }
    const json = (await response.json()) as { data: { id: string } };
    setItems((current) => [
      ...current,
      {
        id: json.data.id,
        name: payload.name,
        genericName: payload.genericName ?? null,
        unit: payload.unit,
        dose: payload.dose,
        schedule: payload.schedule,
        startDate: payload.startDate,
      },
    ]);
    setOpen(false);
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Контекст изменений</p>
          <h1>Медикаменты</h1>
          <span>
            Хронология дозировок и нейтральное сравнение периодов до и после.
          </span>
        </div>
        <button
          className="primary-control"
          onClick={() => setOpen((value) => !value)}
        >
          <Plus size={17} />
          Добавить
        </button>
      </header>
      <aside className="boundary-note">
        StateFlow не оценивает препараты и не предлагает менять дозировку.
        Сравнения не устанавливают причинность.
      </aside>
      {open ? (
        <form action={submit} className="panel inline-create-form">
          <div className="two-fields">
            <label>
              <span>Название</span>
              <input name="name" required maxLength={160} />
            </label>
            <label>
              <span>МНН / generic</span>
              <input name="genericName" maxLength={160} />
            </label>
          </div>
          <div className="three-fields">
            <label>
              <span>Доза</span>
              <input
                type="number"
                min="0.001"
                step="any"
                name="dose"
                required
              />
            </label>
            <label>
              <span>Единица</span>
              <input name="unit" defaultValue="мг" required />
            </label>
            <label>
              <span>Начало</span>
              <input
                type="date"
                name="startDate"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </label>
          </div>
          <label>
            <span>Расписание</span>
            <input name="schedule" placeholder="Например, утром" required />
          </label>
          <label>
            <span>Заметка</span>
            <textarea name="note" rows={2} />
          </label>
          {message ? <p className="form-message">{message}</p> : null}
          <button className="primary-control" disabled={pending}>
            {pending ? <LoaderCircle className="spin" size={17} /> : null}
            Сохранить
          </button>
        </form>
      ) : null}
      <section className="medication-list">
        {items.map((item) => (
          <article className="panel medication-card" key={item.id}>
            <span className="med-icon">
              <Activity size={20} />
            </span>
            <div>
              <h2>{item.name}</h2>
              <p>{item.genericName}</p>
              {item.dose !== undefined ? (
                <div>
                  <strong>
                    {item.dose} {item.unit}
                  </strong>
                  <span>{item.schedule}</span>
                  <span>с {item.startDate}</span>
                </div>
              ) : (
                <p>Период дозировки ещё не добавлен.</p>
              )}
            </div>
            <span className="soft-pill">история периодов</span>
          </article>
        ))}
        {!items.length ? (
          <div className="panel module-empty">
            <Activity />
            <h2>История пуста</h2>
            <p>
              Добавьте препарат и стартовую дозировку. Заметки не используются в
              логах.
            </p>
          </div>
        ) : null}
      </section>
    </>
  );
}
