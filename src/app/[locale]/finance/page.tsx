"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { EntityTable } from "@/entities/common";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getTransactions,
  deleteTransaction,
  type Transaction,
} from "@/actions/transactions";
import { AddTransactionDialog } from "@/features/add-transaction";
import {
  Plus,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TransactionFilter = "all" | "income" | "expense" | "transfer";

/**
 * Finance Page - Main page for managing personal finances
 *
 * Features:
 * - View all transactions with filtering
 * - Summary cards (Balance, Income, Expenses, Transfers)
 * - Add new transactions via dialog
 * - Filter by transaction type
 *
 * @example
 * ```tsx
 * // Navigate to /finance to access this page
 * ```
 */
export default function FinancePage() {
  const t = useTranslations();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);

  /**
   * Load transactions from database
   */
  useEffect(() => {
    loadTransactions();
  }, []);

  /**
   * Load all transactions from server
   */
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to load transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a transaction by ID
   * @param id - Transaction ID to delete
   */
  const _handleDelete = async (id: string) => {
    if (!confirm(t("finance.transactions.confirmDelete"))) return;
    try {
      await deleteTransaction(id);
      await loadTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  /**
   * Handle successful transaction creation
   * Reloads the transaction list
   */
  const handleSuccess = () => {
    loadTransactions();
    setShowAddDialog(false);
  };

  /**
   * Filter transactions by type
   * @param transaction - Transaction to filter
   * @returns true if transaction matches current filter
   */
  const filteredTransactions = transactions.filter((t) =>
    filter === "all" ? true : t.type === filter,
  );

  /**
   * Calculate total income from all income transactions
   */
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  /**
   * Calculate total expenses from all expense transactions
   */
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  /**
   * Calculate total transfers from all transfer transactions
   */
  const totalTransfers = transactions
    .filter((t) => t.type === "transfer")
    .reduce((sum, t) => sum + t.amount, 0);

  /**
   * Calculate balance (income - expenses)
   */
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium text-muted-foreground">
                {t("finance.summary.balance")}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2">${balance.toFixed(2)}</div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-sm font-medium text-muted-foreground">
                {t("finance.summary.income")}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              +${totalIncome.toFixed(2)}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div className="text-sm font-medium text-muted-foreground">
                {t("finance.summary.expenses")}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">
              -${totalExpenses.toFixed(2)}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              <div className="text-sm font-medium text-muted-foreground">
                {t("finance.summary.transfers")}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-blue-600">
              ${totalTransfers.toFixed(2)}
            </div>
          </GlassCard>
        </div>

        {/* Filters */}
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as TransactionFilter)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="all"
              data-color="primary"
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                "data-[state=inactive]:bg-muted/50 hover:data-[state=inactive]:bg-muted",
              )}
              style={
                filter === "all"
                  ? {
                      backgroundColor: "hsl(var(--primary))",
                      color: "hsl(var(--primary-foreground))",
                    }
                  : undefined
              }
            >
              {t("finance.filters.all")}
            </TabsTrigger>
            <TabsTrigger
              value="income"
              data-color="income"
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                "data-[state=inactive]:bg-muted/50 hover:data-[state=inactive]:bg-muted",
              )}
              style={
                filter === "income"
                  ? { backgroundColor: "#16a34a", color: "white" }
                  : undefined
              }
            >
              {t("finance.filters.income")}
            </TabsTrigger>
            <TabsTrigger
              value="expense"
              data-color="expense"
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                "data-[state=inactive]:bg-muted/50 hover:data-[state=inactive]:bg-muted",
              )}
              style={
                filter === "expense"
                  ? { backgroundColor: "#dc2626", color: "white" }
                  : undefined
              }
            >
              {t("finance.filters.expenses")}
            </TabsTrigger>
            <TabsTrigger
              value="transfer"
              data-color="transfer"
              className={cn(
                "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                "data-[state=inactive]:bg-muted/50 hover:data-[state=inactive]:bg-muted",
              )}
              style={
                filter === "transfer"
                  ? { backgroundColor: "#2563eb", color: "white" }
                  : undefined
              }
            >
              {t("finance.filters.transfers")}
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
