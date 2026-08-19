import { ZodError } from "zod";
import { saveDailyEntry } from "@/features/daily-checkin/repository";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { dailyEntryInputSchema } from "@/lib/validation/entries";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = dailyEntryInputSchema.parse(await request.json());
    return apiSuccess(await saveDailyEntry(user.id, input));
  } catch (error) {
    if (error instanceof ZodError)
      return apiError("VALIDATION_ERROR", 400, {
        issues: error.issues.map(({ path, message }) => ({ path, message })),
      });
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
