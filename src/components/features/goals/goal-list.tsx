"use client";

import type { Goal } from "@/features/goals/types";
import { GoalCard } from "./goal-card";
import { cn } from "@/lib/utils";

interface GoalListProps {
  goals: Goal[];
  loading?: boolean;
  emptyMessage?: string;
  onGoalClick?: (goal: Goal) => void;
  onGoalEdit?: (goal: Goal) => void;
  onGoalDelete?: (goal: Goal) => void;
  onGoalFavorite?: (goal: Goal) => void;
  showActions?: boolean;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function GoalList({
  goals,
  loading = false,
  emptyMessage = "No goals found",
  onGoalClick,
  onGoalEdit,
  onGoalDelete,
  onGoalFavorite,
  showActions = false,
  className,
  columns = 3,
}: GoalListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onClick={() => onGoalClick?.(goal)}
          onEdit={() => onGoalEdit?.(goal)}
          onDelete={() => onGoalDelete?.(goal)}
          onToggleFavorite={() => onGoalFavorite?.(goal)}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
