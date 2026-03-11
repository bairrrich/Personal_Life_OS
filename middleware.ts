import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ru"],
  defaultLocale: "en",
  localePrefix: "always", // Always use locale prefix
});

export const config = {
  matcher: ["/", "/(ru|en)/:path*"],
};
