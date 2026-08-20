import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/navigation/app-shell";
import { OfflineSyncManager } from "@/features/offline-sync/sync-manager";
import { ThemeSync } from "@/features/settings/theme-sync";
import { getCurrentSession } from "@/lib/auth/session";
import { normalizeTheme } from "@/lib/theme";
import { getUserPreferences } from "@/lib/user-preferences";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PrivateAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login?next=/app/dashboard");
  const settings = await getUserPreferences(session.user.id);
  const theme = normalizeTheme(settings?.theme);
  return (
    <AppShell username={session.user.username ?? session.user.name}>
      <ThemeSync theme={theme} />
      <OfflineSyncManager />
      {children}
    </AppShell>
  );
}
