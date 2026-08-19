import { users } from "@/db/schema";
import { getDb } from "@/db";
import { AdminView } from "@/features/admin/admin-view";
import { requireUser } from "@/lib/auth/session";
import { notFound } from "next/navigation";
export default async function AdminPage() {
  const current = await requireUser();
  if (current.role !== "admin") notFound();
  const rows = await getDb()
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      role: users.role,
      banned: users.banned,
      createdAt: users.createdAt,
    })
    .from(users);
  return (
    <AdminView
      initialUsers={rows.map((row) => ({
        ...row,
        createdAt: row.createdAt.toISOString(),
      }))}
    />
  );
}
