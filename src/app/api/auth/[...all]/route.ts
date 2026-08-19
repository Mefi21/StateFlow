import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/http/api-response";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;
export const PATCH = handler.PATCH;
export const PUT = handler.PUT;
export const DELETE = handler.DELETE;

export async function POST(request: Request) {
  const isPublicSignup = new URL(request.url).pathname.endsWith(
    "/sign-up/email",
  );
  if (isPublicSignup && process.env.PUBLIC_REGISTRATION !== "true")
    return apiError("REGISTRATION_DISABLED", 403);
  return handler.POST(request);
}
