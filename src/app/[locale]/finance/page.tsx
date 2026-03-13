"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import {
  getTransactions,
  deleteTransaction,
  type Transaction,
} from "@/actions/transactions";
import { AddTransactionDialog } from "@/components/features/finance/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/features/finance/edit-transaction-dialog";
import { ImportExportDialog } from "@/components/features/finance/import-export-dialog";
import {
  Plus,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  Wallet,
  CreditCard,
  Target,
  BarChart3,
  Pencil,
  Trash2,
  RefreshCw,
  PiggyBank,
  Tag,
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
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);

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
  const handleDelete = async (id: string) => {
    if (!confirm(t("finance.transactions.confirmDelete"))) return;
    try {
      await deleteTransaction(id);
      await loadTransactions();
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  /**
   * Edit a transaction
   * @param transaction - Transaction to edit
   */
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("finance.title")}</h1>
            <p className="text-muted-foreground">{t("finance.description")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/finance/accounts">
                <CreditCard className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">
                  {t("finance.accounts.title")}
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/finance/budgets">
                <Target className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">
                  {t("finance.budgets.title")}
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/analytics/finance">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">{t("analytics.title")}</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/finance/recurring">
                <RefreshCw className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">
                  {t("finance.recurring.title")}
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/finance/goals">
                <PiggyBank className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">
                  {t("finance.goals.title")}
                </span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:inline-flex"
            >
              <Link href="/finance/categories">
                <Tag className="h-4 w-4 mr-2" />
                <span className="hidden lg:inline">
                  {t("finance.categories.title")}
                </span>
              </Link>
            </Button>
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
              onClick={() => setShowImportExport(true)}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {t("finance.addTransaction.button")}
              </span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:hidden">
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href="/finance/accounts">
              <CreditCard className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href="/finance/budgets">
              <Target className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href="/analytics/finance">
              <BarChart3 className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href="/finance/recurring">
              <RefreshCw className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href="/finance/goals">
              <PiggyBank className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-shrink-0">
            <Link href="/finance/categories">
              <Tag className="h-4 w-4" />
            </Link>
          </Button>
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
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-md border">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="p-3 text-left font-medium">Описание</th>
                      <th className="p-3 text-right font-medium">Сумма</th>
                      <th className="p-3 text-left font-medium">Тип</th>
                      <th className="p-3 text-left font-medium">Дата</th>
                      <th className="p-3 text-left font-medium">Категория</th>
                      <th className="p-3 text-right font-medium">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-t hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3">{transaction.description}</td>
                        <td
                          className={cn(
                            "p-3 text-right font-medium",
                            transaction.type === "income"
                              ? "text-green-600"
                              : transaction.type === "expense"
                                ? "text-red-600"
                                : "text-blue-600",
                          )}
                        >
                          {transaction.type === "income"
                            ? "+"
                            : transaction.type === "expense"
                              ? "-"
                              : ""}
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              "px-2 py-1 rounded text-xs font-medium",
                              transaction.type === "income"
                                ? "bg-green-100 text-green-800"
                                : transaction.type === "expense"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800",
                            )}
                          >
                            {t(`finance.transactionTypes.${transaction.type}`)}
                          </span>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {transaction.category}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(transaction)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "text-lg font-bold",
                          transaction.type === "income"
                            ? "text-green-600"
                            : transaction.type === "expense"
                              ? "text-red-600"
                              : "text-blue-600",
                        )}
                      >
                        {transaction.type === "income"
                          ? "+"
                          : transaction.type === "expense"
                            ? "-"
                            : ""}
                        ${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span
                          className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            transaction.type === "income"
                              ? "bg-green-100 text-green-800"
                              : transaction.type === "expense"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800",
                          )}
                        >
                          {t(`finance.transactionTypes.${transaction.type}`)}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-muted text-muted-foreground">
                          {transaction.category}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(transaction)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      {/* Add Transaction Dialog */}
      <AddTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
      />

      {/* Edit Transaction Dialog */}
      <EditTransactionDialog
        open={!!editingTransaction}
        onOpenChange={(open) => {
          if (!open) setEditingTransaction(null);
        }}
        onSuccess={handleSuccess}
        transaction={editingTransaction}
      />

      {/* Import/Export Dialog */}
      <ImportExportDialog
        open={showImportExport}
        onOpenChange={setShowImportExport}
        onSuccess={handleSuccess}
      />
    </AppLayout>
  );
}
