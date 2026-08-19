import { ZodError } from "zod";
import { getDb } from "@/db";
import { goals } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { goalInputSchema } from "@/lib/validation/goals";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = goalInputSchema.parse(await request.json());
    const [goal] = await getDb()
      .insert(goals)
      .values({ userId: user.id, ...input })
      .returning({ id: goals.id });
    return apiSuccess(goal, 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
