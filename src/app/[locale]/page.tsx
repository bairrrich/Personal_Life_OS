"use client";

import { Link } from "@/i18n/navigation";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Wallet,
  Utensils,
  Dumbbell,
  Package,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    nameKey: "navigation.dashboard",
    descriptionKey: "dashboard.description",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 to-blue-600",
  },
  {
    nameKey: "navigation.finance",
    descriptionKey: "finance.description",
    href: "/finance",
    icon: Wallet,
    color: "from-green-500 to-green-600",
  },
  {
    nameKey: "navigation.nutrition",
    descriptionKey: "nutrition.description",
    href: "/nutrition",
    icon: Utensils,
    color: "from-orange-500 to-orange-600",
  },
  {
    nameKey: "navigation.workouts",
    descriptionKey: "workouts.description",
    href: "/workouts",
    icon: Dumbbell,
    color: "from-purple-500 to-purple-600",
  },
  {
    nameKey: "navigation.products",
    descriptionKey: "products.description",
    href: "/products",
    icon: Package,
    color: "from-pink-500 to-pink-600",
  },
  {
    nameKey: "navigation.analytics",
    descriptionKey: "analytics.description",
    href: "/analytics",
    icon: BarChart3,
    color: "from-cyan-500 to-cyan-600",
  },
];

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              {t("common.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("common.description")}
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-[oklch(68%_0.22_260_/_0.9)] px-6 py-3 text-sm font-medium text-white shadow-lg hover:bg-[oklch(60%_0.22_260_/_0.9)] transition-colors"
              >
                {t("common.add")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-xl bg-[oklch(98%_0.015_240_/_0.6)] px-6 py-3 text-sm font-medium text-foreground shadow-lg hover:bg-[oklch(96%_0.03_200_/_0.6)] transition-colors border border-white/20"
              >
                {t("navigation.analytics")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.nameKey} href={feature.href}>
              <GlassCard className="h-full p-6 transition-all hover:scale-[1.02] hover:shadow-2xl cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-xl bg-gradient-to-br ${feature.color} p-3 shadow-lg`}
                  >
                    <feature.icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4 space-y-2">
                  <h3 className="text-lg font-semibold">
                    {t(feature.nameKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(feature.descriptionKey)}
                  </p>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 glass">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 {t("common.title")}. Offline-first life management system.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("navigation.dashboard")}
              </Link>
              <Link
                href="/analytics"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t("navigation.analytics")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
