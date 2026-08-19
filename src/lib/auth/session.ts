import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "./auth";

export const getCurrentSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireUser() {
  const session = await getCurrentSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session.user;
}
