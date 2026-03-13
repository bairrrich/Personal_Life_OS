"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Workout } from "@/features/workouts";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle, Circle } from "lucide-react";

interface WorkoutCardProps {
  workout: Workout;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  className?: string;
}

const workoutTypeColors: Record<string, string> = {
  strength: "bg-red-500",
  hypertrophy: "bg-blue-500",
  endurance: "bg-green-500",
  power: "bg-yellow-500",
  hiit: "bg-orange-500",
  cardio: "bg-purple-500",
};

const workoutTypeLabels: Record<string, string> = {
  strength: "Strength",
  hypertrophy: "Hypertrophy",
  endurance: "Endurance",
  power: "Power",
  hiit: "HIIT",
  cardio: "Cardio",
};

export function WorkoutCard({
  workout,
  onClick,
  onEdit,
  onDelete,
  showActions = false,
  className,
}: WorkoutCardProps) {
  const typeColor = workoutTypeColors[workout.type] || "bg-gray-500";
  const typeLabel = workoutTypeLabels[workout.type] || workout.type;

  const completedSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0,
  );
  const totalSets = workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.length,
    0,
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        workout.completed && "border-green-500/30",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", typeColor)} />
              <CardTitle className="text-lg">{workout.name}</CardTitle>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDate(workout.date)}</span>
              {workout.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{workout.duration} min</span>
                </div>
              )}
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge
              variant={workout.completed ? "default" : "secondary"}
              className="text-xs"
            >
              {workout.completed ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <Circle className="h-3 w-3 mr-1" />
              )}
              {workout.completed ? "Completed" : "In Progress"}
            </Badge>
            {workout.rating && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Rating:</span>
                <span className="text-sm font-bold">{workout.rating}/10</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {workout.exercises.length} exercises
            </span>
            {totalSets > 0 && (
              <span className="text-muted-foreground">
                {completedSets}/{totalSets} sets
              </span>
            )}
          </div>

          {workout.exercises.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">
                {workout.exercises
                  .slice(0, 3)
                  .map((ex) => ex.exerciseName)
                  .join(", ")}
                {workout.exercises.length > 3 && "..."}
              </div>
            </div>
          )}

          {workout.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {workout.notes}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
