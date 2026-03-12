"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { getTransactions, type Transaction } from "@/actions/transactions";
import {
  expenseCategories,
  incomeCategories,
} from "@/features/finance/categories";
import { cn } from "@/lib/utils";

export function RecentTransactionsWidget() {
  const t = useTranslations();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const data = await getTransactions();
        setTransactions(data.slice(0, 5)); // Last 5 transactions
      } catch (error) {
        console.error("Failed to load recent transactions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const getCategoryById = (categoryId: string) => {
    return [...expenseCategories, ...incomeCategories].find(
      (c) => c.id === categoryId,
    );
  };

  return (
    <GlassCard className="p-6">
      <h2 className="text-lg font-semibold mb-4">
        {t("dashboard.widgets.recentTransactions")}
      </h2>
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("common.loading")}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("dashboard.widgets.noTransactions")}
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const category = getCategoryById(tx.category);
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{category?.icon || "📝"}</div>
                  <div>
                    <div className="font-medium text-sm">{tx.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {category ? t(category.nameKey) : tx.category} •{" "}
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    "font-semibold",
                    tx.type === "income"
                      ? "text-green-600"
                      : tx.type === "expense"
                        ? "text-red-600"
                        : "text-blue-600",
                  )}
                >
                  {tx.type === "income"
                    ? "+"
                    : tx.type === "expense"
                      ? "-"
                      : ""}
                  ${tx.amount.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassCard>
  );
}
