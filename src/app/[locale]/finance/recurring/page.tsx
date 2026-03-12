"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  getRecurringTransactions,
  deleteRecurringTransaction,
  processRecurringTransactions,
  type RecurringTransaction,
} from "@/actions/recurring-transactions";
import { AddRecurringTransactionDialog } from "@/features/add-recurring-transaction";
import { Plus, Pencil, Trash2, RefreshCw, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  expenseCategories,
  incomeCategories,
} from "@/features/finance/categories";

export default function RecurringTransactionsPage() {
  const t = useTranslations();
  const [recurringTxs, setRecurringTxs] = useState<RecurringTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<RecurringTransaction | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRecurringTransactions();
  }, []);

  const loadRecurringTransactions = async () => {
    setLoading(true);
    try {
      const data = await getRecurringTransactions();
      setRecurringTxs(data);
    } catch (error) {
      console.error("Failed to load recurring transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("finance.recurring.confirmDelete"))) return;
    try {
      const result = await deleteRecurringTransaction(id);
      if (result.success) {
        await loadRecurringTransactions();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Failed to delete recurring transaction:", error);
    }
  };

  const handleEdit = (transaction: RecurringTransaction) => {
    setEditingTransaction(transaction);
    setShowAddDialog(true);
  };

  const handleSuccess = () => {
    loadRecurringTransactions();
    setShowAddDialog(false);
    setEditingTransaction(null);
  };

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const result = await processRecurringTransactions();
      if (result.success) {
        alert(`${t("finance.recurring.processed")}: ${result.processed}`);
        await loadRecurringTransactions();
      }
    } catch (error) {
      console.error("Failed to process recurring transactions:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleEnabled = async (id: string, currentEnabled: boolean) => {
    try {
      const { updateRecurringTransaction } =
        await import("@/actions/recurring-transactions");
      await updateRecurringTransaction({
        id,
        enabled: !currentEnabled,
      });
      await loadRecurringTransactions();
    } catch (error) {
      console.error("Failed to toggle recurring transaction:", error);
    }
  };

  const getCategoryById = (categoryId: string) => {
    return [...expenseCategories, ...incomeCategories].find(
      (c) => c.id === categoryId,
    );
  };

  const getFrequencyLabel = (frequency: string) => {
    return t(`finance.recurring.frequencies.${frequency}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t("finance.recurring.title")}
            </h1>
            <p className="text-muted-foreground">{t("finance.description")}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleProcess}
              disabled={processing}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", processing && "animate-spin")}
              />
              {t("finance.recurring.process")}
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t("finance.recurring.addRecurring")}
            </Button>
          </div>
        </div>

        {/* Recurring Transactions List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : recurringTxs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("finance.recurring.noRecurring")}
            </div>
          ) : (
            recurringTxs.map((tx) => {
              const category = getCategoryById(tx.categoryId);
              return (
                <GlassCard
                  key={tx.id}
                  className={cn(
                    "p-6 transition-colors hover:bg-muted/50",
                    !tx.enabled && "opacity-50",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {category?.icon || "📝"}
                          </span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {tx.description}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {category ? t(category.nameKey) : tx.categoryId} •{" "}
                              {getFrequencyLabel(tx.frequency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">
                              {t("finance.addTransaction.amount")}:
                            </span>{" "}
                            <span
                              className={cn(
                                "font-medium",
                                tx.transactionType === "income"
                                  ? "text-green-600"
                                  : "text-red-600",
                              )}
                            >
                              {tx.transactionType === "income" ? "+" : "-"}$
                              {tx.amount.toFixed(2)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              {t("finance.recurring.nextDate")}:
                            </span>{" "}
                            <span className="font-medium">
                              {new Date(tx.nextDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                        <span className="text-sm text-muted-foreground">
                          {tx.enabled
                            ? t("finance.recurring.enabled")
                            : t("finance.recurring.disabled")}
                        </span>
                        <Switch
                          checked={tx.enabled}
                          onCheckedChange={() =>
                            handleToggleEnabled(tx.id, tx.enabled)
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(tx)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tx.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AddRecurringTransactionDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
        editData={editingTransaction}
      />
    </AppLayout>
  );
}
