"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { getTransactionSummary } from "@/actions/transactions";
import { cn } from "@/lib/utils";
import { Wallet } from "lucide-react";

interface BalanceWidgetProps {
  className?: string;
}

export function BalanceWidget({ className }: BalanceWidgetProps) {
  const t = useTranslations();
  const [summary, setSummary] = useState<{
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      const data = await getTransactionSummary();
      setSummary(data);
      setLoading(false);
    };
    loadSummary();
  }, []);

  if (loading) {
    return (
      <GlassCard className={cn("p-6", className)}>
        <div className="text-center text-muted-foreground">Loading...</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className={cn("p-6", className)}>
      <div className="flex items-center gap-2 mb-2">
        <Wallet className="h-5 w-5 text-muted-foreground" />
        <div className="text-sm font-medium text-muted-foreground">
          {t("dashboard.widgets.balance")}
        </div>
      </div>
      <div className="text-3xl font-bold">
        ${summary?.balance.toFixed(2) ?? "0.00"}
      </div>
      <div className="flex gap-4 mt-4 text-sm">
        <span className="text-green-600">
          +${summary?.totalIncome.toFixed(2) ?? "0.00"}
        </span>
        <span className="text-red-600">
          -${summary?.totalExpenses.toFixed(2) ?? "0.00"}
        </span>
      </div>
    </GlassCard>
  );
}
