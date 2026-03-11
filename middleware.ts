import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export const config = {
  matcher: ["/", "/(ru|en)/:path*"],
};
