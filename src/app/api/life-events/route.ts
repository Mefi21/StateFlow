import { ZodError } from "zod";
import { getDb } from "@/db";
import { lifeEvents } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { lifeEventInputSchema } from "@/lib/validation/context";
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = lifeEventInputSchema.parse(await request.json());
    const [row] = await getDb()
      .insert(lifeEvents)
      .values({
        userId: user.id,
        ...input,
        recordedAt: new Date(input.recordedAt),
      })
      .returning({ id: lifeEvents.id });
    return apiSuccess(row, 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
