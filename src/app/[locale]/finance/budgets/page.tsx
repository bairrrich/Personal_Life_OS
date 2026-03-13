"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getBudgets, deleteBudget, type Budget } from "@/actions/budgets";
import { AddBudgetDialog } from "@/components/features/finance/add-budget-dialog";
import { Plus, Pencil, Trash2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BudgetsPage() {
  const t = useTranslations();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{
    id: string;
    amount: number;
    currency: string;
    categoryId: string;
    period: "daily" | "weekly" | "monthly" | "yearly";
  } | null>(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error("Failed to load budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("finance.budgets.confirmDelete"))) return;
    try {
      const result = await deleteBudget(id);
      if (result.success) {
        await loadBudgets();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Failed to delete budget:", error);
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget({
      id: budget.id,
      amount: budget.amount,
      currency: budget.currency,
      categoryId: budget.categoryId,
      period: budget.period,
    });
    setShowAddDialog(true);
  };

  const handleSuccess = () => {
    loadBudgets();
    setShowAddDialog(false);
    setEditingBudget(null);
  };

  const getPeriodLabel = (period: string) => {
    return t(`finance.budgets.periods.${period}`);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("finance.budgets.title")}</h1>
            <p className="text-muted-foreground">{t("finance.description")}</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("finance.budgets.addBudget")}
          </Button>
        </div>

        {/* Budgets Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : budgets.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {t("finance.budgets.noBudgets")}
            </div>
          ) : (
            budgets.map((budget) => (
              <GlassCard
                key={budget.id}
                className="p-6 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {budget.categoryName || budget.categoryId}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getPeriodLabel(budget.period)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(budget)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("finance.budgets.spent")}
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        (budget.percentUsed || 0) >= 100
                          ? "text-red-600"
                          : (budget.percentUsed || 0) >= 80
                            ? "text-yellow-600"
                            : "text-green-600",
                      )}
                    >
                      {budget.spent?.toFixed(2)} / {budget.amount.toFixed(2)}{" "}
                      {budget.currency}
                    </span>
                  </div>

                  <Progress
                    value={budget.percentUsed || 0}
                    className={cn(
                      "h-3",
                      (budget.percentUsed || 0) >= 100
                        ? "[&>div]:bg-red-600"
                        : (budget.percentUsed || 0) >= 80
                          ? "[&>div]:bg-yellow-600"
                          : "[&>div]:bg-green-600",
                    )}
                  />

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {t("finance.budgets.percentUsed")}:{" "}
                      {budget.percentUsed?.toFixed(1)}%
                    </span>
                    <span
                      className={cn(
                        (budget.remaining || 0) < 0
                          ? "text-red-600 font-medium"
                          : "",
                      )}
                    >
                      {t("finance.budgets.remaining")}:{" "}
                      {budget.remaining?.toFixed(2)} {budget.currency}
                    </span>
                  </div>
                </div>

                {(budget.percentUsed || 0) >= 100 && (
                  <div className="mt-3 text-sm text-red-600 font-medium">
                    ⚠️ {t("finance.budgets.overBudget")}
                  </div>
                )}
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Budget Dialog */}
      <AddBudgetDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
        editData={editingBudget}
      />
    </AppLayout>
  );
}
