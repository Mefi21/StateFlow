"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { authClient } from "@/lib/auth/auth-client";
import { normalizeTheme } from "@/lib/theme";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTheme } = useTheme();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await authClient.signIn.username({
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      rememberMe: true,
    });
    if (result.error) {
      setError("Не удалось войти. Проверьте имя пользователя и пароль.");
      setPending(false);
      return;
    }
    try {
      const response = await fetch("/api/settings", { cache: "no-store" });
      const payload = (await response.json()) as {
        data?: { theme?: string } | null;
      };
      if (response.ok) setTheme(normalizeTheme(payload.data?.theme));
    } catch {
      // The account layout will synchronize the preference after navigation.
    }
    const next = searchParams.get("next");
    router.push(next?.startsWith("/app") ? next : "/app/dashboard");
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
          required
          autoFocus
        />
      </label>
      <label>
        <span>Пароль</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={8}
          required
        />
      </label>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="primary-control" disabled={pending}>
        {pending ? <LoaderCircle className="spin" size={18} /> : null}
        {pending ? "Входим…" : "Войти"}
      </button>
    </form>
  );
}
