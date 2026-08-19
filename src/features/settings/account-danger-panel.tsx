"use client";

import { useState } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

const confirmation = "УДАЛИТЬ STATEFLOW";

export function AccountDangerPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeAccount() {
    if (phrase !== confirmation || !password) return;
    setPending(true);
    setError(null);
    const result = await authClient.deleteUser({
      password,
      callbackURL: "/",
    });
    if (result.error) {
      setError("Пароль не принят или аккаунт не удалось удалить.");
      setPending(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="account-danger">
      <button className="danger-control" onClick={() => setOpen(!open)}>
        <Trash2 size={16} />
        Удалить аккаунт
      </button>
      {open ? (
        <div className="danger-confirmation">
          <p>
            Это безвозвратно удалит аккаунт и связанные записи. Сначала скачайте
            JSON backup. Введите <strong>{confirmation}</strong> и пароль.
          </p>
          <label>
            <span>Фраза подтверждения</span>
            <input
              value={phrase}
              onChange={(event) => setPhrase(event.target.value)}
              autoComplete="off"
            />
          </label>
          <label>
            <span>Текущий пароль</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button
            className="danger-control"
            onClick={removeAccount}
            disabled={pending || phrase !== confirmation || password.length < 8}
          >
            {pending ? <LoaderCircle className="spin" size={16} /> : null}
            Удалить безвозвратно
          </button>
        </div>
      ) : null}
    </div>
  );
}
