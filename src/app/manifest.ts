import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: process.env.NEXT_PUBLIC_APP_NAME ?? "StateFlow",
    short_name: "StateFlow",
    description:
      "Longitudinal personal state tracking without diagnostic claims.",
    start_url: "/app/dashboard",
    display: "standalone",
    background_color: "#151619",
    theme_color: "#151619",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Новый Snapshot",
        short_name: "Snapshot",
        url: "/app/snapshots/new",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
