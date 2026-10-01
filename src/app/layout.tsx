import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "MaritimeVTS — TCP Valparaíso",
    template: "%s · MaritimeVTS",
  },
  description:
    "Plataforma ejecutiva de control de tráfico marítimo con integración AIS, Radar y Cámaras. TCP Valparaíso.",
  keywords: ["VTS", "AIS", "TCP Valparaíso", "Directemar", "IALA", "Ley 21.719"],
  authors: [{ name: "MaritimeVTS" }],
  applicationName: "MaritimeVTS",
  generator: "MaritimeVTS",
  referrer: "origin-when-cross-origin",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "MaritimeVTS",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "MaritimeVTS — TCP Valparaíso",
    description:
      "Plataforma ejecutiva de control de tráfico marítimo con integración AIS, Radar y Cámaras.",
    type: "website",
    siteName: "MaritimeVTS",
    locale: "es_CL",
  },
  twitter: {
    card: "summary",
    title: "MaritimeVTS — TCP Valparaíso",
    description:
      "Plataforma ejecutiva de control de tráfico marítimo con integración AIS, Radar y Cámaras.",
  },
};

export const viewport: Viewport = {
  themeColor: "#06b6d4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  );
}
