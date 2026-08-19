import { and, eq } from "drizzle-orm";
import { z, ZodError } from "zod";
import { getDb } from "@/db";
import { goalMeasurements, goals } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { goalMeasurementInputSchema } from "@/lib/validation/goals";

export async function POST(
  request: Request,
  context: RouteContext<"/api/goals/[id]/measurements">,
) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const goalId = z.uuid().parse((await context.params).id);
    const input = goalMeasurementInputSchema.parse(await request.json());
    const db = getDb();
    const [owned] = await db
      .select({ id: goals.id })
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.id)))
      .limit(1);
    if (!owned) return apiError("NOT_FOUND", 404);
    const [measurement] = await db
      .insert(goalMeasurements)
      .values({
        userId: user.id,
        goalId,
        ...input,
        recordedAt: new Date(input.recordedAt),
      })
      .returning({ id: goalMeasurements.id });
    return apiSuccess(measurement, 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
