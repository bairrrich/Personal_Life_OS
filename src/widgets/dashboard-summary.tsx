"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { getTransactionSummary } from "@/actions/transactions";
import { getAccounts } from "@/actions/accounts";
import { getBudgets } from "@/actions/budgets";
import { Wallet } from "lucide-react";

export function DashboardSummary() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
    activeBudgets: number;
    totalBudgets: number;
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summary, accounts, budgets] = await Promise.all([
          getTransactionSummary(),
          getAccounts(),
          getBudgets(),
        ]);

        const totalBalance = accounts.reduce(
          (sum, acc) => sum + acc.balance,
          0,
        );
        const activeBudgets = budgets.filter(
          (b) => (b.percentUsed || 0) < 100,
        ).length;

        setData({
          totalBalance,
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          activeBudgets,
          totalBudgets: budgets.length,
        });
      } catch (error) {
        console.error("Failed to load dashboard summary:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} className="p-6">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-32 bg-muted rounded mt-4 animate-pulse" />
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <GlassCard className="p-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm font-medium text-muted-foreground">
            {t("dashboard.summary.totalBalance")}
          </div>
        </div>
        <div className="text-3xl font-bold mt-2">
          ${data?.totalBalance.toFixed(2) ?? "0.00"}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-green-600" />
          <div className="text-sm font-medium text-muted-foreground">
            {t("dashboard.summary.income")}
          </div>
        </div>
        <div className="text-3xl font-bold mt-2 text-green-600">
          +${data?.totalIncome.toFixed(2) ?? "0.00"}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-red-600" />
          <div className="text-sm font-medium text-muted-foreground">
            {t("dashboard.summary.expenses")}
          </div>
        </div>
        <div className="text-3xl font-bold mt-2 text-red-600">
          -${data?.totalExpenses.toFixed(2) ?? "0.00"}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="text-sm font-medium text-muted-foreground">
          {t("dashboard.summary.activeBudgets")}
        </div>
        <div className="text-2xl font-bold mt-2">
          {data?.activeBudgets ?? 0} / {data?.totalBudgets ?? 0}
        </div>
      </GlassCard>
    </div>
  );
}
