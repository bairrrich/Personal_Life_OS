import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Temporarily disabled due to Turbopack + i18n bug in Next.js 16
  // output: "standalone",
  // Use webpack for production builds until Turbopack bug is fixed
  experimental: {
    // Force dynamic rendering for i18n routes
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "world.openfoodfacts.org" },
      { protocol: "https", hostname: "static.openfoodfacts.org" },
      { protocol: "https", hostname: "wger.de" },
    ],
  },
};

export default withNextIntl(nextConfig);
