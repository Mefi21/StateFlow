import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";

export const metadata: Metadata = {
  title: "Демо",
  robots: { index: true, follow: true },
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (process.env.DEMO_MODE === "false") notFound();
  return <AppShell demo>{children}</AppShell>;
}
