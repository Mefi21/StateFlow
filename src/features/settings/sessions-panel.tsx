"use client";

import { useCallback, useEffect, useState } from "react";
import { Laptop, LoaderCircle, ShieldX } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

type ActiveSession = {
  id: string;
  token: string;
  createdAt: Date | string;
  expiresAt: Date | string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export function SessionsPanel() {
  const router = useRouter();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [pending, setPending] = useState<string | null>("load");
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const result = await authClient.listSessions();
    if (result.error) {
      setError(true);
      setPending(null);
      return;
    }
    setError(false);
    setSessions(result.data ?? []);
    setPending(null);
  }, []);

  useEffect(() => {
    let active = true;
    void authClient.listSessions().then((result) => {
      if (!active) return;
      if (result.error) {
        setError(true);
        setPending(null);
        return;
      }
      setError(false);
      setSessions(result.data ?? []);
      setPending(null);
    });
    return () => {
      active = false;
    };
  }, []);

  async function revoke(token: string) {
    setPending(token);
    const result = await authClient.revokeSession({ token });
    if (result.error) {
      setError(true);
      setPending(null);
      return;
    }
    await load();
  }

  async function revokeOthers() {
    setPending("others");
    const result = await authClient.revokeOtherSessions();
    if (result.error) {
      setError(true);
      setPending(null);
      return;
    }
    await load();
  }

  async function revokeAll() {
    if (!window.confirm("Завершить все сессии и перейти на страницу входа?"))
      return;
    setPending("all");
    const result = await authClient.revokeSessions();
    if (result.error) {
      setError(true);
      setPending(null);
      return;
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="sessions-panel">
      <div className="settings-title">
        <h3>Активные сессии</h3>
        <p>Завершите доступ на потерянном или общем устройстве.</p>
      </div>
      {pending === "load" ? (
        <p className="session-loading">
          <LoaderCircle className="spin" size={17} /> Загрузка сессий…
        </p>
      ) : (
        <div className="session-list">
          {sessions.map((session) => (
            <div key={session.id}>
              <Laptop size={18} />
              <span>
                <strong>
                  {session.userAgent?.slice(0, 72) || "Устройство"}
                </strong>
                <small>
                  Создана {new Date(session.createdAt).toLocaleString("ru-RU")}
                  {session.ipAddress ? ` · ${session.ipAddress}` : ""}
                </small>
              </span>
              <button
                className="text-control"
                onClick={() => revoke(session.token)}
                disabled={pending !== null}
              >
                {pending === session.token ? "Завершение…" : "Завершить"}
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="session-actions">
        <button
          className="secondary-control"
          onClick={revokeOthers}
          disabled={pending !== null}
        >
          Завершить другие
        </button>
        <button
          className="danger-control"
          onClick={revokeAll}
          disabled={pending !== null}
        >
          <ShieldX size={16} />
          Выйти везде
        </button>
      </div>
      {error ? (
        <p className="form-error">Не удалось обновить список сессий.</p>
      ) : null}
    </div>
  );
}
