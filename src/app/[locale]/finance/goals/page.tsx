"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  getSavingsGoals,
  deleteSavingsGoal,
  addSavingsGoalContribution,
  type SavingsGoal,
} from "@/actions/savings-goals";
import { AddSavingsGoalDialog } from "@/components/features/finance";
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SavingsGoalsPage() {
  const t = useTranslations();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [contributionGoalId, setContributionGoalId] = useState<string | null>(
    null,
  );
  const [contributionAmount, setContributionAmount] = useState(0);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await getSavingsGoals();
      setGoals(data);
    } catch (error) {
      console.error("Failed to load savings goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("finance.goals.confirmDelete"))) return;
    try {
      const result = await deleteSavingsGoal(id);
      if (result.success) {
        await loadGoals();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Failed to delete savings goal:", error);
    }
  };

  const handleEdit = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setShowAddDialog(true);
  };

  const handleSuccess = () => {
    loadGoals();
    setShowAddDialog(false);
    setEditingGoal(null);
    setContributionGoalId(null);
  };

  const handleAddContribution = async (goalId: string) => {
    if (contributionAmount <= 0) return;
    try {
      const result = await addSavingsGoalContribution(
        goalId,
        contributionAmount,
      );
      if (result.success) {
        setContributionAmount(0);
        setContributionGoalId(null);
        await loadGoals();
      }
    } catch (error) {
      console.error("Failed to add contribution:", error);
    }
  };

  const getDaysLeft = (deadline?: string) => {
    if (!deadline) return null;
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getMonthlyTarget = (goal: SavingsGoal) => {
    const daysLeft = getDaysLeft(goal.deadline);
    if (!daysLeft || daysLeft <= 0) return null;
    const monthsLeft = daysLeft / 30;
    const remaining = goal.targetAmount - goal.currentAmount;
    return remaining / monthsLeft;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("finance.goals.title")}</h1>
            <p className="text-muted-foreground">{t("finance.description")}</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("finance.goals.addGoal")}
          </Button>
        </div>

        {/* Goals Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {loading ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : goals.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {t("finance.goals.noGoals")}
            </div>
          ) : (
            goals.map((goal) => {
              const daysLeft = getDaysLeft(goal.deadline);
              const monthlyTarget = getMonthlyTarget(goal);
              const isCompleted = goal.progress >= 100;

              return (
                <GlassCard
                  key={goal.id}
                  className={cn(
                    "p-6 transition-colors hover:bg-muted/50",
                    isCompleted && "border-green-500",
                  )}
                  style={{
                    borderTopColor: goal.color || "#3b82f6",
                    borderTopWidth: "4px",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{goal.icon || "🎯"}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{goal.name}</h3>
                        {goal.deadline && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {new Date(goal.deadline).toLocaleDateString()}
                              {daysLeft !== null && (
                                <span className="ml-1">
                                  ({daysLeft} {t("finance.goals.daysLeft")})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(goal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("finance.goals.currentAmount")}
                      </span>
                      <span className="font-medium">
                        ${goal.currentAmount.toFixed(2)} / $
                        {goal.targetAmount.toFixed(2)}
                      </span>
                    </div>

                    <Progress
                      value={goal.progress}
                      className={cn(
                        "h-3",
                        isCompleted
                          ? "[&>div]:bg-green-600"
                          : goal.progress >= 75
                            ? "[&>div]:bg-yellow-600"
                            : "[&>div]:bg-blue-600",
                      )}
                    />

                    <div className="flex justify-between text-xs">
                      <span
                        className={cn(
                          "font-medium",
                          isCompleted ? "text-green-600" : "text-blue-600",
                        )}
                      >
                        {goal.progress.toFixed(1)}%
                      </span>
                      {isCompleted && (
                        <span className="text-green-600 font-medium">
                          ✓ {t("finance.goals.completed")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Monthly Target */}
                  {monthlyTarget && !isCompleted && (
                    <div className="mt-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{t("finance.goals.monthlyTarget")}: </span>
                        <span className="font-medium text-foreground">
                          ${monthlyTarget.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Add Contribution */}
                  {!isCompleted && contributionGoalId === goal.id ? (
                    <div className="mt-4 flex gap-2">
                      <Input
                        type="number"
                        placeholder={t("finance.goals.contributionAmount")}
                        value={contributionAmount || ""}
                        onChange={(e) =>
                          setContributionAmount(parseFloat(e.target.value) || 0)
                        }
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAddContribution(goal.id)}
                      >
                        OK
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setContributionGoalId(null);
                          setContributionAmount(0);
                        }}
                      >
                        ✕
                      </Button>
                    </div>
                  ) : (
                    !isCompleted && (
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={() => setContributionGoalId(goal.id)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("finance.goals.addContribution")}
                      </Button>
                    )
                  )}
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      {/* Add/Edit Goal Dialog */}
      <AddSavingsGoalDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
        editData={editingGoal}
      />
    </AppLayout>
  );
}
