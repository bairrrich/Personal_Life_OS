import { getRequestConfig } from "next-intl/server";

export const locales = ["en", "ru"] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Fallback to default locale if not set
  if (!locale || !locales.includes(locale as Locale)) {
    locale = "ru";
  }

  return {
    locale: locale as Locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
