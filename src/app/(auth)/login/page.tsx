import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="auth-page">
      <Link href="/" className="wordmark">
        <span className="mark">S</span>StateFlow
      </Link>
      <section className="auth-card">
        <p className="eyebrow">Ваше пространство</p>
        <h1>С возвращением</h1>
        <p>Войдите, чтобы продолжить наблюдение. Email не требуется.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
        <div className="auth-divider">
          <span>или</span>
        </div>
        <Link className="demo-control" href="/demo">
          Открыть демо без входа
        </Link>
      </section>
      <p className="auth-footnote">
        StateFlow не является медицинским или диагностическим сервисом.
      </p>
    </main>
  );
}
