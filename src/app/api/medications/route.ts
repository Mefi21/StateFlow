import { ZodError } from "zod";
import { getDb } from "@/db";
import { medicationEvents, medicationPeriods, medications } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { medicationInputSchema } from "@/lib/validation/goals";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = medicationInputSchema.parse(await request.json());
    const result = await getDb().transaction(async (tx) => {
      const [medication] = await tx
        .insert(medications)
        .values({
          userId: user.id,
          name: input.name,
          genericName: input.genericName,
          unit: input.unit,
        })
        .returning({ id: medications.id });
      await tx.insert(medicationPeriods).values({
        userId: user.id,
        medicationId: medication.id,
        startDate: input.startDate,
        dose: input.dose,
        schedule: input.schedule,
        note: input.note,
      });
      await tx.insert(medicationEvents).values({
        userId: user.id,
        medicationId: medication.id,
        eventType: "started",
        recordedAt: new Date(`${input.startDate}T12:00:00.000Z`),
        newDose: input.dose,
      });
      return medication;
    });
    return apiSuccess(result, 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
