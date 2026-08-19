import { NextResponse } from "next/server";
import { privateNoStoreHeaders } from "@/lib/security/request";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status, headers: privateNoStoreHeaders() },
  );
}

export function apiError(
  code: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    { success: false, error: { code, ...(details ? { details } : {}) } },
    { status, headers: privateNoStoreHeaders() },
  );
}
