import { z, ZodError } from "zod";
import {
  deleteSnapshotForUser,
  findSnapshotForUser,
  updateSnapshotForUser,
} from "@/features/snapshots/repository";
import { apiError, apiSuccess } from "@/lib/http/api-response";
import { requireUser } from "@/lib/auth/session";
import { isSameOriginRequest } from "@/lib/security/request";
import { snapshotUpdateSchema } from "@/lib/validation/entries";

const idSchema = z.uuid();

export async function GET(
  _request: Request,
  context: RouteContext<"/api/snapshots/[id]">,
) {
  try {
    const user = await requireUser();
    const id = idSchema.parse((await context.params).id);
    const snapshot = await findSnapshotForUser(user.id, id);
    return snapshot ? apiSuccess(snapshot) : apiError("NOT_FOUND", 404);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/snapshots/[id]">,
) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const id = idSchema.parse((await context.params).id);
    return (await deleteSnapshotForUser(user.id, id))
      ? apiSuccess({ id })
      : apiError("NOT_FOUND", 404);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/snapshots/[id]">,
) {
  if (!isSameOriginRequest(request)) return apiError("ORIGIN_NOT_ALLOWED", 403);
  try {
    const user = await requireUser();
    const id = idSchema.parse((await context.params).id);
    const input = snapshotUpdateSchema.parse(await request.json());
    const result = await updateSnapshotForUser(user.id, id, input);
    if (result.status === "not_found") return apiError("NOT_FOUND", 404);
    if (result.status === "conflict")
      return apiError("VERSION_CONFLICT", 409, {
        currentVersion: result.currentVersion,
      });
    return apiSuccess(result);
  } catch (error) {
    if (error instanceof ZodError) return apiError("VALIDATION_ERROR", 400);
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
