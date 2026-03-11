import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["en", "ru"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export const config = {
  // Match all internationalized paths
  matcher: ["/", "/(ru|en)/:path*"],
};
