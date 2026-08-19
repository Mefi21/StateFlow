"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Download,
  LoaderCircle,
  LogOut,
  Monitor,
  Moon,
  Save,
  Sun,
} from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import { useTheme } from "@/components/theme/theme-provider";
import type { CoreMetric } from "@/features/metrics/definitions";
import { AccountDangerPanel } from "@/features/settings/account-danger-panel";
import { SessionsPanel } from "@/features/settings/sessions-panel";
import type { ThemePreference } from "@/lib/theme";

type MetricSetting = {
  slug: string;
  enabled: boolean;
  snapshotEnabled: boolean;
  dailyEnabled: boolean;
  dashboardEnabled: boolean;
  sortOrder: number;
};
type SettingsData = {
  theme: string;
  timezone: string;
  targetSleepMinutes: number;
  morningCheckInEnabled: boolean;
};

export function SettingsView({
  initial,
  metrics,
  initialMetricSettings = [],
  demo = false,
  admin = false,
}: {
  initial: SettingsData;
  metrics: readonly CoreMetric[];
  initialMetricSettings?: MetricSetting[];
  demo?: boolean;
  admin?: boolean;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [timezone, setTimezone] = useState(initial.timezone);
  const [targetSleep, setTargetSleep] = useState(initial.targetSleepMinutes);
  const [morning, setMorning] = useState(initial.morningCheckInEnabled);
  const [metricSettings, setMetricSettings] = useState<MetricSetting[]>(
    metrics.map(
      (metric, index) =>
        initialMetricSettings.find(
          (setting) => setting.slug === metric.slug,
        ) ?? {
          slug: metric.slug,
          enabled: true,
          snapshotEnabled: metric.snapshotEnabled,
          dailyEnabled: metric.dailyEnabled,
          dashboardEnabled: [
            "future_wanting",
            "current_pleasure",
            "energy",
            "anxiety",
            "mastery",
          ].includes(metric.slug),
          sortOrder: index,
        },
    ),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  function updateMetric(
    slug: string,
    key: keyof Pick<
      MetricSetting,
      "enabled" | "snapshotEnabled" | "dailyEnabled" | "dashboardEnabled"
    >,
  ) {
    setMetricSettings((current) =>
      current.map((metric) =>
        metric.slug === slug ? { ...metric, [key]: !metric[key] } : metric,
      ),
    );
  }
  function chooseTheme(value: ThemePreference) {
    setTheme(value);
    setStatus("idle");
  }
  async function save() {
    if (demo) {
      setStatus("saved");
      return;
    }
    setStatus("saving");
    const response = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        theme,
        timezone,
        targetSleepMinutes: targetSleep,
        morningCheckInEnabled: morning,
        metrics: metricSettings,
      }),
    });
    setStatus(response.ok ? "saved" : "error");
  }
  async function signOut() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Персонализация и приватность</p>
          <h1>Настройки</h1>
          <span>
            Управляйте тем, что вы отслеживаете и где это отображается.
          </span>
        </div>
        <button
          className="primary-control"
          onClick={save}
          disabled={status === "saving"}
        >
          {status === "saving" ? (
            <LoaderCircle className="spin" size={17} />
          ) : status === "saved" ? (
            <Check size={17} />
          ) : (
            <Save size={17} />
          )}
          Сохранить
        </button>
      </header>
      {demo ? (
        <p className="boundary-note">
          В demo настройки можно исследовать, но они не изменяют синтетический
          профиль.
        </p>
      ) : null}
      <div className="settings-layout">
        <nav className="settings-nav">
          <a href="#appearance">Оформление</a>
          <a href="#metrics">Метрики</a>
          <a href="#sleep">Сон</a>
          <a href="#privacy">Приватность</a>
          <a href="#account">Аккаунт</a>
        </nav>
        <div className="settings-sections">
          <section className="panel" id="appearance">
            <div className="settings-title">
              <h2>Оформление</h2>
              <p>Тема хранится в настройках аккаунта.</p>
            </div>
            <div className="theme-picker">
              {[
                ["light", Sun, "Светлая"],
                ["dark", Moon, "Тёмная"],
                ["system", Monitor, "Системная"],
              ].map(([value, Icon, label]) => {
                const ThemeIcon = Icon as typeof Sun;
                return (
                  <button
                    key={String(value)}
                    className={theme === value ? "selected" : ""}
                    onClick={() => chooseTheme(value as ThemePreference)}
                  >
                    <ThemeIcon size={18} />
                    {String(label)}
                  </button>
                );
              })}
            </div>
          </section>
          <section className="panel" id="metrics">
            <div className="settings-title">
              <h2>Метрики</h2>
              <p>Core-определения нельзя удалить, но можно скрыть из форм.</p>
            </div>
            <div className="metric-settings-head">
              <span>Метрика</span>
              <span>Вкл.</span>
              <span>Snapshot</span>
              <span>Daily</span>
              <span>Dashboard</span>
            </div>
            {metrics.map((metric) => {
              const setting = metricSettings.find(
                (item) => item.slug === metric.slug,
              )!;
              return (
                <div className="metric-setting-row" key={metric.slug}>
                  <div>
                    <strong>{metric.name}</strong>
                    <small>{metric.category}</small>
                  </div>
                  {(
                    [
                      "enabled",
                      "snapshotEnabled",
                      "dailyEnabled",
                      "dashboardEnabled",
                    ] as const
                  ).map((key) => (
                    <label key={key}>
                      <input
                        type="checkbox"
                        checked={setting[key]}
                        onChange={() => updateMetric(metric.slug, key)}
                      />
                      <span />
                    </label>
                  ))}
                </div>
              );
            })}
          </section>
          <section className="panel" id="sleep">
            <div className="settings-title">
              <h2>Сон и утро</h2>
              <p>Цель используется только как личное сравнение.</p>
            </div>
            <label className="setting-line">
              <span>
                Целевая продолжительность
                <strong>{(targetSleep / 60).toFixed(1)} ч</strong>
              </span>
              <input
                type="range"
                min="240"
                max="720"
                step="15"
                value={targetSleep}
                onChange={(event) => setTargetSleep(Number(event.target.value))}
              />
            </label>
            <label className="timezone-setting">
              <span>Часовой пояс IANA</span>
              <input
                value={timezone}
                maxLength={100}
                placeholder="Europe/Moscow"
                onChange={(event) => setTimezone(event.target.value)}
              />
              <button
                type="button"
                className="text-control"
                onClick={() =>
                  setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
                }
              >
                Использовать часовой пояс устройства
              </button>
            </label>
            <label className="switch-line">
              <span>
                Morning Check-in<small>Короткая запись после пробуждения</small>
              </span>
              <input
                type="checkbox"
                checked={morning}
                onChange={(event) => setMorning(event.target.checked)}
              />
            </label>
          </section>
          <section className="panel" id="privacy">
            <div className="settings-title">
              <h2>Экспорт</h2>
              <p>
                Полная переносимая копия данных без отправки третьим сторонам.
              </p>
            </div>
            <div className="export-actions">
              <a
                href={demo ? undefined : "/api/export?format=json"}
                aria-disabled={demo}
              >
                <Download size={17} />
                JSON backup
              </a>
              <a
                href={demo ? undefined : "/api/export?format=csv"}
                aria-disabled={demo}
              >
                <Download size={17} />
                Snapshots CSV
              </a>
            </div>
          </section>
          <section className="panel" id="account">
            <div className="settings-title">
              <h2>Аккаунт</h2>
              <p>
                Сессии защищены HTTP-only cookies. Выйдите на этом устройстве,
                когда закончите.
              </p>
            </div>
            <div className="export-actions">
              {admin ? (
                <a href="/app/settings/admin">Управление пользователями</a>
              ) : null}
              {demo ? null : (
                <button className="secondary-control" onClick={signOut}>
                  <LogOut size={17} />
                  Выйти
                </button>
              )}
            </div>
            {demo ? null : <SessionsPanel />}
            {demo ? null : <AccountDangerPanel />}
          </section>
          {status === "error" ? (
            <p className="form-error">
              Настройки не сохранены. Попробуйте ещё раз.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
