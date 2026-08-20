import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  async headers() {
    const isDevelopment = process.env.NODE_ENV !== "production";
    const scriptSrc = isDevelopment
      ? "'self' 'unsafe-inline' 'unsafe-eval'"
      : "'self' 'unsafe-inline'";
    const upgradeInsecureRequests = isDevelopment
      ? ""
      : "; upgrade-insecure-requests";
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self' ${isDevelopment ? "ws: http:" : ""}; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'${upgradeInsecureRequests}`,
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
