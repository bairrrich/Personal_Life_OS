"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Exercise } from "@/features/workouts";
import { cn } from "@/lib/utils";
import {
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  DIFFICULTY_LEVELS,
} from "@/features/workouts";

interface ExerciseCardProps {
  exercise: Exercise;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  className?: string;
}

export function ExerciseCard({
  exercise,
  onClick,
  onEdit,
  onDelete,
  showActions = false,
  className,
}: ExerciseCardProps) {
  const muscleGroup = MUSCLE_GROUPS.find((mg) =>
    exercise.muscleGroups.includes(mg.id),
  );
  const difficulty = DIFFICULTY_LEVELS.find(
    (d) => d.id === exercise.difficulty,
  );

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        exercise.isCustom && "border-primary/20",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg">{exercise.name}</CardTitle>
            {muscleGroup && (
              <Badge variant="secondary" className="text-xs">
                {muscleGroup.icon} {muscleGroup.label}
              </Badge>
            )}
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
        <div className="space-y-2">
          {exercise.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exercise.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1">
            {exercise.equipment.slice(0, 3).map((eq) => {
              const equipment = EQUIPMENT_TYPES.find((e) => e.id === eq);
              return equipment ? (
                <Badge key={eq} variant="outline" className="text-xs">
                  {equipment.icon} {equipment.label}
                </Badge>
              ) : null;
            })}
          </div>

          {difficulty && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  difficulty.color === "green" && "bg-green-500",
                  difficulty.color === "yellow" && "bg-yellow-500",
                  difficulty.color === "red" && "bg-red-500",
                )}
              />
              <span className="text-xs text-muted-foreground">
                {difficulty.label}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
