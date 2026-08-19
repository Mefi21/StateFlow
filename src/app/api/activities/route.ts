import { ZodError } from "zod";
import { getDb } from "@/db";
import { activities } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { activityInputSchema } from "@/lib/validation/context";
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = activityInputSchema.parse(await request.json());
    const [row] = await getDb()
      .insert(activities)
      .values({
        userId: user.id,
        ...input,
        startedAt: new Date(input.startedAt),
        endedAt: input.endedAt ? new Date(input.endedAt) : undefined,
      })
      .returning({ id: activities.id });
    return apiSuccess(row, 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
