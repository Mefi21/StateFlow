import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["cyrillic", "latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "StateFlow — understand your state over time",
    template: "%s · StateFlow",
  },
  description:
    "Приватный инструмент для долгосрочного наблюдения за эмоциональным состоянием, сном и контекстом.",
  applicationName: "StateFlow",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "StateFlow",
    description: "Understand how your state changes over time.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 908,
        alt: "StateFlow analytics dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StateFlow",
    description: "Understand how your state changes over time.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f7f4",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      data-theme="system"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ServiceWorkerRegistration />
        {children}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </body>
    </html>
  );
}
