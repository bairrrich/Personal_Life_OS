"use client";

import { useEffect, useState } from "react";
import { getTransactionSummary } from "@/actions/transactions";
import { cn } from "@/lib/utils";

interface BalanceWidgetProps {
  className?: string;
}

export function BalanceWidget({ className }: BalanceWidgetProps) {
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

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className={cn("p-4 bg-card rounded-lg border", className)}>
      <div className="text-sm font-medium text-muted-foreground">
        Total Balance
      </div>
      <div className="text-3xl font-bold mt-2">
        ${summary?.balance.toFixed(2) ?? "0.00"}
      </div>
      <div className="flex gap-4 mt-2 text-xs">
        <span className="text-green-600">
          +${summary?.totalIncome.toFixed(2) ?? "0.00"}
        </span>
        <span className="text-red-600">
          -${summary?.totalExpenses.toFixed(2) ?? "0.00"}
        </span>
      </div>
    </div>
  );
}
