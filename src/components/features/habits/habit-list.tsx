"use client";

import type { Habit } from "@/features/habits/types";
import { HabitCard } from "./habit-card";
import { cn } from "@/lib/utils";

interface HabitListProps {
  habits: Habit[];
  loading?: boolean;
  emptyMessage?: string;
  onHabitClick?: (habit: Habit) => void;
  onHabitEdit?: (habit: Habit) => void;
  onHabitDelete?: (habit: Habit) => void;
  onHabitFavorite?: (habit: Habit) => void;
  onHabitComplete?: (habit: Habit) => void;
  showActions?: boolean;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function HabitList({
  habits,
  loading = false,
  emptyMessage = "No habits found",
  onHabitClick,
  onHabitEdit,
  onHabitDelete,
  onHabitFavorite,
  onHabitComplete,
  showActions = false,
  className,
  columns = 3,
}: HabitListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (habits.length === 0) {
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
      {habits.map((habit) => (
        <HabitCard
          key={habit.id}
          habit={habit}
          onClick={() => onHabitClick?.(habit)}
          onEdit={() => onHabitEdit?.(habit)}
          onDelete={() => onHabitDelete?.(habit)}
          onToggleFavorite={() => onHabitFavorite?.(habit)}
          onToggleComplete={() => onHabitComplete?.(habit)}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
