import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { NextIntlClientProvider } from "next-intl";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Life OS",
  description: "Offline-first персональная life-management система",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Personal Life OS",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(99% 0.015 240)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(12% 0.04 260)" },
  ],
};

// Static imports for all locales
import enMessages from "@/messages/en.json";
import ruMessages from "@/messages/ru.json";

const messages = {
  en: enMessages,
  ru: ruMessages,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale === "en" || locale === "ru" ? locale : "en";
  const loadedMessages = messages[validLocale];

  return (
    <html lang={validLocale} suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <NextIntlClientProvider
            locale={validLocale}
            messages={loadedMessages}
          >
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
