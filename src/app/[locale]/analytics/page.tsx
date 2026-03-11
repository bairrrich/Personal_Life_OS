"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { useTranslations } from "next-intl";

export default function AnalyticsPage() {
  const t = useTranslations();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
          <p className="text-muted-foreground">{t("analytics.description")}</p>
        </div>
        <GlassCard className="p-8 text-center">
          <p className="text-lg font-medium">{t("analytics.inDevelopment")}</p>
          <p className="text-muted-foreground mt-2">
            {t("analytics.comingSoon")}
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
