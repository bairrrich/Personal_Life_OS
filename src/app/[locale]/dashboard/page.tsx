import { AppLayout } from "@/components/layout/app-layout";
import { useTranslations } from "next-intl";
import { DashboardSummary } from "@/widgets/dashboard-summary";
import { BalanceWidget } from "@/widgets/balance-widget";
import { RecentTransactionsWidget } from "@/widgets/recent-transactions-widget";
import { NutritionSummaryWidget } from "@/widgets/nutrition-summary-widget";

export default function DashboardPage() {
  const t = useTranslations();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
          <p className="text-muted-foreground">{t("dashboard.description")}</p>
        </div>

        {/* Summary Cards */}
        <DashboardSummary />

        {/* Widgets Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <BalanceWidget />
          <RecentTransactionsWidget />
        </div>

        {/* Nutrition Widget */}
        <div className="grid gap-6 lg:grid-cols-3">
          <NutritionSummaryWidget />
        </div>
      </div>
    </AppLayout>
  );
}
