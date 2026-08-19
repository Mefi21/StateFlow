import Link from "next/link";
import {
  Activity,
  BarChart3,
  CalendarDays,
  Clock3,
  FileText,
  Gauge,
  Goal,
  Home,
  Layers3,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { NavLink } from "./nav-link";

const navigation = [
  { path: "", label: "Обзор", icon: Home },
  { path: "/timeline", label: "Хронология", icon: Clock3 },
  { path: "/history", label: "История", icon: CalendarDays },
  { path: "/analytics", label: "Аналитика", icon: BarChart3 },
  { path: "/goals", label: "Цели", icon: Goal },
  { path: "/context", label: "Контекст", icon: Layers3 },
  { path: "/medications", label: "Медикаменты", icon: Activity },
  { path: "/reports", label: "Отчёты", icon: FileText },
  { path: "/search", label: "Поиск", icon: Search },
  { path: "/settings", label: "Настройки", icon: Settings },
];

export function AppShell({
  children,
  demo = false,
  username,
}: {
  children: React.ReactNode;
  demo?: boolean;
  username?: string | null;
}) {
  const base = demo ? "/demo" : "/app/dashboard";
  const hrefFor = (path: string) =>
    path ? (demo ? `/demo${path}` : `/app${path}`) : base;
  const addHref = demo ? "/demo/snapshot" : "/app/snapshots/new";

  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <Link href={base} className="wordmark">
          <span className="mark">S</span>StateFlow
        </Link>
        <nav aria-label="Навигация приложения">
          {navigation.map(({ path, label, icon: Icon }) => (
            <NavLink href={hrefFor(path)} key={label} exact={!path}>
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-profile">
          <span className="avatar">
            {demo ? "D" : username?.slice(0, 1).toUpperCase() || "U"}
          </span>
          <span>
            <strong>{demo ? "Demo profile" : username}</strong>
            <small>{demo ? "Только чтение" : "Личное пространство"}</small>
          </span>
          <SlidersHorizontal size={16} />
        </div>
      </aside>

      <div className="app-main-wrap">
        {demo ? (
          <div className="demo-banner">
            <span>Демо · синтетические данные</span>
            <Link href="/login">Войти в своё пространство →</Link>
          </div>
        ) : null}
        <div className="app-content">{children}</div>
      </div>

      <nav className="mobile-nav" aria-label="Мобильная навигация">
        <NavLink href={base} exact>
          <Home size={21} />
          <span>Главная</span>
        </NavLink>
        <NavLink href={hrefFor("/history")}>
          <CalendarDays size={21} />
          <span>История</span>
        </NavLink>
        <Link
          href={addHref}
          className="mobile-add"
          aria-label="Добавить снимок"
        >
          <Plus size={27} />
        </Link>
        <NavLink href={hrefFor("/analytics")}>
          <Gauge size={21} />
          <span>Аналитика</span>
        </NavLink>
        <NavLink href={hrefFor("/settings")}>
          <Settings size={21} />
          <span>Настройки</span>
        </NavLink>
      </nav>
    </div>
  );
}
