"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Habit } from "@/features/habits/types";
import { cn } from "@/lib/utils";
import {
  getCategoryIcon,
  getCategoryColor,
  getFrequencyIcon,
  getStatusIcon,
} from "@/features/habits/categories";
import { Heart, Pencil, Trash2, Flame, CheckCircle2 } from "lucide-react";

interface HabitCardProps {
  habit: Habit;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onToggleComplete?: () => void;
  showActions?: boolean;
  className?: string;
}

export function HabitCard({
  habit,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  onToggleComplete,
  showActions = false,
  className,
}: HabitCardProps) {
  const categoryIcon = getCategoryIcon(habit.category);
  const categoryColor = getCategoryColor(habit.category);
  const frequencyIcon = getFrequencyIcon(habit.frequency);
  const statusIcon = getStatusIcon(habit.status);

  const isCompletedToday = habit.completions.some(
    (c) => c.date === new Date().toISOString().split("T")[0] && c.completed,
  );

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        habit.isFavorite && "border-yellow-500/50",
        isCompletedToday && "border-green-500/50",
        habit.status === "paused" && "border-yellow-500/30",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryIcon}</span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                {habit.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">{frequencyIcon}</span>
                  {habit.frequency}
                </Badge>
                {habit.status !== "active" && (
                  <Badge variant="secondary" className="text-xs">
                    <span className="mr-1">{statusIcon}</span>
                    {habit.status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {habit.isFavorite && (
              <Badge
                variant="secondary"
                className="text-xs bg-yellow-500/20 text-yellow-600"
              >
                <Heart className="w-3 h-3 fill-yellow-600" />
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Streak */}
          <div className="flex items-center gap-2">
            <Flame
              className={cn(
                "w-4 h-4",
                habit.streak.current > 0
                  ? "text-orange-500"
                  : "text-muted-foreground",
              )}
            />
            <span
              className={cn(
                "text-sm font-medium",
                habit.streak.current > 0
                  ? "text-orange-500"
                  : "text-muted-foreground",
              )}
            >
              {habit.streak.current} day{habit.streak.current !== 1 ? "s" : ""}{" "}
              streak
            </span>
            {habit.streak.longest > habit.streak.current && (
              <span className="text-xs text-muted-foreground">
                (best: {habit.streak.longest})
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium">
              {habit.targetValue} {habit.unit}
            </span>
          </div>

          {/* Today's Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Today:</span>
            {isCompletedToday ? (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="secondary">Not completed</Badge>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant={isCompletedToday ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete?.();
                }}
              >
                <CheckCircle2 className="w-4 h-4 mr-1" />
                {isCompletedToday ? "Completed" : "Complete"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="w-4 h-4 mr-1" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.();
                }}
              >
                <Heart
                  className={cn(
                    "w-4 h-4",
                    habit.isFavorite && "fill-red-500 text-red-500",
                  )}
                />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
