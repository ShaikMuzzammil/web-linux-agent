import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Shaik Muzzammil | Web Linux Agent",
  description:
    "Interactive Ubuntu 22.04-themed portfolio by Shaik Muzzammil — CSE student & Full Stack Developer at Amrita Vishwa Vidyapeetham.",
  keywords: [
    "Shaik Muzzammil", "Web Linux Agent", "Ubuntu Portfolio",
    "Full Stack Developer", "CSE Student", "Next.js", "React",
  ],
  authors: [{ name: "Shaik Muzzammil", url: "https://github.com/ShaikMuzzammil" }],
  creator: "Shaik Muzzammil",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Shaik Muzzammil Portfolio",
    title: "Shaik Muzzammil | Web Linux Agent",
    description: "Interactive Ubuntu 22.04-themed portfolio — open-source & free.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shaik Muzzammil | Web Linux Agent",
    description: "Interactive Ubuntu 22.04-themed portfolio by Shaik Muzzammil.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#E95420",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,400&family=Ubuntu+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{ fontFamily: "'Ubuntu', 'Segoe UI', system-ui, sans-serif" }}
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
