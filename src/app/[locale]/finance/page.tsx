"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { EntityTable } from "@/entities/common";
import { Button } from "@/components/ui/button";
import { getTransactions, type Transaction } from "@/actions/transactions";
import { AddTransactionDialog } from "@/features/add-transaction";
import { Plus, Filter, Download } from "lucide-react";

export default function FinancePage() {
  const t = useTranslations();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    const data = await getTransactions();
    setTransactions(data);
    setLoading(false);
  };

  const handleSuccess = () => {
    loadTransactions();
  };

  const filteredTransactions = transactions.filter((t) =>
    filter === "all" ? true : t.type === filter,
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("finance.title")}</h1>
            <p className="text-muted-foreground">{t("finance.description")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label={t("finance.filter")}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("finance.export")}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("finance.addTransaction.button")}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="p-6">
            <div className="text-sm font-medium text-muted-foreground">
              {t("finance.summary.balance")}
            </div>
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-sm font-medium text-muted-foreground">
              {t("finance.summary.income")}
            </div>
            <div className="text-2xl font-bold text-green-600">
              +${totalIncome.toFixed(2)}
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <div className="text-sm font-medium text-muted-foreground">
              {t("finance.summary.expenses")}
            </div>
            <div className="text-2xl font-bold text-red-600">
              -${totalExpenses.toFixed(2)}
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            {t("finance.filters.all")}
          </Button>
          <Button
            variant={filter === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("income")}
          >
            {t("finance.filters.income")}
          </Button>
          <Button
            variant={filter === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("expense")}
          >
            {t("finance.filters.expenses")}
          </Button>
        </div>

        {/* Transactions Table */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {t("finance.transactions.title")}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("finance.transactions.noData")}
            </div>
          ) : (
            <EntityTable
              entities={filteredTransactions.map((t) => ({
                id: t.id,
                type: "transaction" as const,
                name: t.description,
                data: {
                  amount: t.amount,
                  type: t.type,
                  date: new Date(t.date).getTime(),
                  category: t.category,
                },
                createdAt: new Date(t.createdAt).getTime(),
                updatedAt: new Date(t.updatedAt).getTime(),
              }))}
              columns={["name", "amount", "type", "date", "category"]}
              onRowClick={(entity) => console.log("Clicked:", entity)}
            />
          )}
        </GlassCard>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
      />
    </AppLayout>
  );
}
