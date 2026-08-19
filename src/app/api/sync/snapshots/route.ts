import { ZodError } from "zod";
import { createSnapshot } from "@/features/snapshots/repository";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { requireUser } from "@/lib/auth/session";
import { isSameOriginRequest } from "@/lib/security/request";
import { snapshotSyncSchema } from "@/lib/validation/entries";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const input = snapshotSyncSchema.parse(await request.json());
    const acknowledged = [];
    for (const snapshot of input.snapshots)
      acknowledged.push(await createSnapshot(user.id, snapshot));
    return apiSuccess({ acknowledged });
  } catch (error) {
    if (error instanceof ZodError)
      return apiError("VALIDATION_ERROR", 400, {
        issues: error.issues.map(({ path, message }) => ({ path, message })),
      });
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    if (error instanceof Error && error.message === "RECORD_CONFLICT")
      return apiError("RECORD_CONFLICT", 409);
    return apiError("INTERNAL_ERROR", 500);
  }
}
