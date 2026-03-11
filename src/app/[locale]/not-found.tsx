"use client";

import Link from "next/link";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function NotFound() {
  const t = useTranslations("errors");

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 text-center">
        <div className="space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
            <span className="text-4xl font-bold text-muted-foreground">
              404
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{t("notFound")}</h2>
            <p className="text-muted-foreground">{t("notFoundDescription")}</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              {t("common.back")}
            </Button>
            <Link href="/">
              <Button>{t("common.home")}</Button>
            </Link>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
