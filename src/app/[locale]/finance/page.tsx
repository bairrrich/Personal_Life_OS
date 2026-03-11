"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { useTranslations } from "next-intl";

export default function FinancePage() {
  const t = useTranslations();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("finance.title")}</h1>
          <p className="text-muted-foreground">{t("finance.description")}</p>
        </div>
        <GlassCard className="p-8 text-center">
          <p className="text-lg font-medium">{t("finance.inDevelopment")}</p>
          <p className="text-muted-foreground mt-2">
            {t("finance.comingSoon")}
          </p>
        </GlassCard>
      </div>
    </AppLayout>
  );
}
