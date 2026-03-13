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
import { Plus, Flame, TrendingUp, Target, Calendar } from "lucide-react";
import { HabitList, AddHabitDialog } from "@/components/features/habits";
import {
  useHabits,
  calculateHabitStats,
  getHabitsDueToday,
  getHabitsCompletedToday,
  type HabitFilters,
} from "@/features/habits/client";
import { habitCategories } from "@/features/habits/categories";
import { cn } from "@/lib/utils";

export default function HabitsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<HabitFilters>({});

  const { habits, loading, refresh } = useHabits(filters);

  const stats = useMemo(() => calculateHabitStats(habits), [habits]);

  const filteredHabits = useMemo(() => {
    if (activeTab === "all") return habits;
    if (activeTab === "due") return getHabitsDueToday(habits);
    if (activeTab === "completed") return getHabitsCompletedToday(habits);
    if (activeTab === "streaks")
      return habits.filter((h) => h.streak.current > 0);
    if (activeTab === "favorites") return habits.filter((h) => h.isFavorite);
    return habits;
  }, [habits, activeTab]);

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
            <h1 className="text-3xl font-bold">{t("habits.title")}</h1>
            <p className="text-muted-foreground">{t("habits.description")}</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("habits.addHabit")}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.activeHabits}</p>
                <p className="text-sm text-muted-foreground">Active Habits</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.habitsWithActiveStreak}
                </p>
                <p className="text-sm text-muted-foreground">Active Streaks</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.averageCompletionRate}%
                </p>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Longest Streak Highlight */}
        {stats.longestStreak && (
          <GlassCard className="p-4 border-orange-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-semibold">Longest Streak</p>
                  <p className="text-sm text-muted-foreground">
                    {stats.longestStreak.habitTitle}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-500">
                  {stats.longestStreak.days}
                </p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Tabs and Filters */}
        <div className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="due">Due Today</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="streaks">🔥 Streaks</TabsTrigger>
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
              {habitCategories.map((cat) => (
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

        {/* Habits Grid */}
        <HabitList
          habits={filteredHabits}
          loading={loading}
          emptyMessage={
            activeTab === "due"
              ? "No habits due today. Great job!"
              : activeTab === "completed"
                ? "No habits completed today yet"
                : "No habits found. Create your first habit!"
          }
          showActions
          columns={2}
        />

        {/* Add/Edit Habit Dialog */}
        <AddHabitDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refresh}
        />
      </div>
    </AppLayout>
  );
}
