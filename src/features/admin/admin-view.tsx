"use client";

import { useState } from "react";
import { Ban, LoaderCircle, Plus, Trash2, UserRoundCheck } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

type ManagedUser = {
  id: string;
  username: string | null;
  name: string;
  role: string;
  banned: boolean;
  createdAt: string;
};

export function AdminView({ initialUsers }: { initialUsers: ManagedUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  async function create(formData: FormData) {
    setPending(true);
    setMessage(null);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const result = await authClient.admin.createUser({
      email: `${username.toLowerCase()}@stateflow.local`,
      name: username,
      password,
      role: "user",
      data: { username, displayUsername: username },
    });
    setPending(false);
    if (result.error || !result.data) {
      setMessage("Не удалось создать пользователя.");
      return;
    }
    setUsers((current) => [
      ...current,
      {
        id: result.data.user.id,
        username,
        name: username,
        role: "user",
        banned: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setMessage(`Пользователь ${username} создан.`);
  }
  async function toggleBan(user: ManagedUser) {
    const result = user.banned
      ? await authClient.admin.unbanUser({ userId: user.id })
      : await authClient.admin.banUser({
          userId: user.id,
          banReason: "Temporarily disabled by administrator",
        });
    if (result.error) {
      setMessage("Операция не выполнена.");
      return;
    }
    setUsers((current) =>
      current.map((item) =>
        item.id === user.id ? { ...item, banned: !item.banned } : item,
      ),
    );
  }
  async function remove(user: ManagedUser) {
    if (
      !window.confirm(
        `Удалить аккаунт ${user.username ?? user.name} и принадлежащие ему данные? Это действие необратимо.`,
      )
    )
      return;
    const result = await authClient.admin.removeUser({ userId: user.id });
    if (result.error) {
      setMessage("Не удалось удалить аккаунт.");
      return;
    }
    setUsers((current) => current.filter((item) => item.id !== user.id));
  }
  return (
    <>
      <header className="page-heading">
        <div>
          <p>Администрирование сервера</p>
          <h1>Пользователи</h1>
          <span>Управление аккаунтами без доступа к личным журналам.</span>
        </div>
      </header>
      <p className="boundary-note">
        Этот интерфейс намеренно не содержит функции «просмотреть данные
        пользователя».
      </p>
      <form action={create} className="panel inline-create-form">
        <div className="two-fields">
          <label>
            <span>Имя пользователя</span>
            <input
              name="username"
              minLength={3}
              maxLength={32}
              pattern="[A-Za-z0-9_]+"
              required
            />
          </label>
          <label>
            <span>Временный пароль</span>
            <input
              name="password"
              type="password"
              minLength={8}
              maxLength={128}
              required
            />
          </label>
        </div>
        <button className="primary-control" disabled={pending}>
          {pending ? (
            <LoaderCircle className="spin" size={17} />
          ) : (
            <Plus size={17} />
          )}
          Создать пользователя
        </button>
        {message ? (
          <p className="form-message" role="status">
            {message}
          </p>
        ) : null}
      </form>
      <section className="panel admin-user-list">
        {users.map((user) => (
          <article key={user.id}>
            <span className="avatar">
              {(user.username ?? user.name).slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{user.username ?? user.name}</strong>
              <small>
                {user.role} · создан{" "}
                {new Date(user.createdAt).toLocaleDateString("ru-RU")}
              </small>
            </div>
            <em className={user.banned ? "banned" : "active"}>
              {user.banned ? "Заблокирован" : "Активен"}
            </em>
            <button
              onClick={() => toggleBan(user)}
              aria-label={
                user.banned
                  ? `Разблокировать ${user.name}`
                  : `Заблокировать ${user.name}`
              }
            >
              {user.banned ? <UserRoundCheck /> : <Ban />}
            </button>
            <button
              onClick={() => remove(user)}
              aria-label={`Удалить ${user.name}`}
            >
              <Trash2 />
            </button>
          </article>
        ))}
      </section>
    </>
  );
}
