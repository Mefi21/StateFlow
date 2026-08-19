import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { medicationPeriods, medications } from "@/db/schema";
import { MedicationsView } from "@/features/medications/medications-view";
import { requireUser } from "@/lib/auth/session";
export default async function MedicationsPage() {
  const user = await requireUser();
  const rows = await getDb()
    .select({
      id: medications.id,
      name: medications.name,
      genericName: medications.genericName,
      unit: medications.unit,
      dose: medicationPeriods.dose,
      schedule: medicationPeriods.schedule,
      startDate: medicationPeriods.startDate,
    })
    .from(medications)
    .leftJoin(
      medicationPeriods,
      eq(medicationPeriods.medicationId, medications.id),
    )
    .where(eq(medications.userId, user.id))
    .orderBy(desc(medicationPeriods.startDate));
  const latestPeriods = [
    ...new Map(rows.map((row) => [row.id, row])).values(),
  ].map((row) => ({
    ...row,
    dose: row.dose ?? undefined,
    schedule: row.schedule ?? undefined,
    startDate: row.startDate ?? undefined,
  }));
  return <MedicationsView initialItems={latestPeriods} />;
}
