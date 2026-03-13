"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Plus, Target, Trophy, TrendingUp, AlertCircle } from "lucide-react";
import {
  GoalList,
  AddGoalDialog,
  MilestoneTracker,
} from "@/components/features/goals";
import {
  useGoals,
  useGoal,
  calculateGoalStats,
  type GoalFilters,
  type Goal,
} from "@/features/goals/client";
import { goalCategories, goalStatuses } from "@/features/goals/categories";
import { cn } from "@/lib/utils";

export default function GoalsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [filters, setFilters] = useState<GoalFilters>({});

  const { goals, loading, refresh } = useGoals(filters);
  const { goal: selectedGoal } = useGoal(selectedGoalId || undefined);

  const stats = useMemo(() => calculateGoalStats(goals), [goals]);

  const filteredGoals = useMemo(() => {
    if (activeTab === "all") return goals;
    if (activeTab === "active")
      return goals.filter((g) => g.status === "active");
    if (activeTab === "completed")
      return goals.filter((g) => g.status === "completed");
    if (activeTab === "favorites") return goals.filter((g) => g.isFavorite);
    return goals;
  }, [goals, activeTab]);

  const handleCategoryFilter = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category === "all" ? undefined : (category as any),
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("goals.title")}</h1>
            <p className="text-muted-foreground">{t("goals.description")}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("goals.addGoal")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeGoals}</p>
                <p className="text-sm text-muted-foreground">Active Goals</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedGoals}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle
                className={cn(
                  "w-8 h-8",
                  stats.behindGoals > 0 ? "text-orange-500" : "text-green-500",
                )}
              />
              <div>
                <p className="text-2xl font-bold">{stats.behindGoals}</p>
                <p className="text-sm text-muted-foreground">Behind Schedule</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Upcoming Deadlines */}
        {stats.upcomingDeadlines.length > 0 && (
          <GlassCard className="p-4 border-orange-500/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Upcoming Deadlines
            </h3>
            <div className="space-y-2">
              {stats.upcomingDeadlines.slice(0, 3).map((goal: Goal) => {
                const daysLeft = goal.deadline
                  ? Math.ceil(
                      (goal.deadline - Date.now()) / (1000 * 60 * 60 * 24),
                    )
                  : 0;
                return (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10"
                  >
                    <div>
                      <p className="font-medium">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {goal.progress}% complete
                      </p>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        daysLeft <= 3 ? "text-red-500" : "text-orange-500",
                      )}
                    >
                      {daysLeft}d left
                    </span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Goals List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Tabs and Filters */}
            <div className="space-y-4">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="favorites">⭐ Favorites</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Category Filter */}
              <Select
                value={filters.category || "all"}
                onValueChange={handleCategoryFilter}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {goalCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{t(cat.nameKey)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Goals Grid */}
            <GoalList
              goals={filteredGoals}
              loading={loading}
              emptyMessage="No goals found. Create your first goal!"
              showActions
              columns={2}
              onGoalClick={(goal) => setSelectedGoalId(goal.id)}
            />
          </div>

          {/* Goal Details Sidebar */}
          <div className="space-y-4">
            {selectedGoal ? (
              <>
                <GlassCard className="p-4">
                  <h3 className="font-semibold text-lg mb-2">
                    {selectedGoal.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {selectedGoal.description || "No description"}
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <span>{selectedGoal.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <span>{selectedGoal.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {selectedGoal.progress}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span>
                        {selectedGoal.currentValue} {selectedGoal.unit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target:</span>
                      <span>
                        {selectedGoal.targetValue} {selectedGoal.unit}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                <MilestoneTracker milestones={selectedGoal.milestones} />
              </>
            ) : (
              <GlassCard className="p-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a goal to view details
                </p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Add/Edit Goal Dialog */}
        <AddGoalDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refresh}
        />
      </div>
    </AppLayout>
  );
}
