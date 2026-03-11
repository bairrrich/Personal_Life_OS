import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale === "en" || locale === "ru" ? locale : "en";
  return {
    locale: validLocale,
    // Use relative path for Turbopack dev compatibility
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
