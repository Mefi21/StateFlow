import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Регистрация",
  robots: { index: false, follow: false },
};
export default function RegisterPage() {
  const enabled = process.env.PUBLIC_REGISTRATION === "true";
  return (
    <main className="auth-page">
      <Link href="/" className="wordmark">
        <span className="mark">S</span>StateFlow
      </Link>
      <section className="auth-card">
        <p className="eyebrow">Новый аккаунт</p>
        <h1>{enabled ? "Создайте пространство" : "Регистрация закрыта"}</h1>
        <p>
          {enabled
            ? "Email не требуется. Данные каждого аккаунта изолированы."
            : "Владелец сервера может создать аккаунт в панели администратора."}
        </p>
        {enabled ? (
          <RegisterForm />
        ) : (
          <Link href="/login" className="demo-control">
            Вернуться ко входу
          </Link>
        )}
      </section>
    </main>
  );
}
