export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.method === "GET" || request.method === "HEAD";
  const expected = new URL(process.env.NEXT_PUBLIC_APP_URL ?? request.url)
    .origin;
  return origin === expected || origin === new URL(request.url).origin;
}

export function privateNoStoreHeaders(): HeadersInit {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    Pragma: "no-cache",
    Vary: "Cookie",
  };
}
