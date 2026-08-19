import { ZodError } from "zod";
import { createCaffeineEntry } from "@/features/caffeine/repository";
import { requireUser } from "@/lib/auth/session";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { isSameOriginRequest } from "@/lib/security/request";
import { caffeineInputSchema } from "@/lib/validation/entries";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    return apiSuccess(
      await createCaffeineEntry(
        user.id,
        caffeineInputSchema.parse(await request.json()),
      ),
      201,
    );
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
