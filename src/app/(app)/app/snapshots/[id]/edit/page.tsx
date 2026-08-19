import { notFound } from "next/navigation";
import { getSnapshotDetail } from "@/features/snapshots/repository";
import { SnapshotEditForm } from "@/features/snapshots/snapshot-edit-form";
import { requireUser } from "@/lib/auth/session";
export default async function SnapshotEditPage({
  params,
}: PageProps<"/app/snapshots/[id]/edit">) {
  const user = await requireUser();
  const record = await getSnapshotDetail(user.id, (await params).id);
  if (!record) notFound();
  return (
    <SnapshotEditForm
      snapshot={{ ...record, recordedAt: record.recordedAt.toISOString() }}
    />
  );
}
