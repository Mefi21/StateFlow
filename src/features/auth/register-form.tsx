"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const result = await authClient.signUp.email({
      email: `${username.toLowerCase()}@stateflow.local`,
      name: username,
      username,
      password,
    });
    if (result.error) {
      setError("Регистрация недоступна или данные уже используются.");
      setPending(false);
      return;
    }
    router.push("/app/dashboard");
    router.refresh();
  }
  return (
    <form action={submit} className="auth-form">
      <label>
        <span>Имя пользователя</span>
        <input
          name="username"
          autoComplete="username"
          minLength={3}
          maxLength={32}
          pattern="[A-Za-z0-9_]+"
          required
        />
      </label>
      <label>
        <span>Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={128}
          required
        />
      </label>
      <small>Минимум 8 символов; рекомендуем 12+.</small>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="primary-control" disabled={pending}>
        {pending ? <LoaderCircle className="spin" size={18} /> : null}
        {pending ? "Создаём…" : "Создать аккаунт"}
      </button>
    </form>
  );
}
