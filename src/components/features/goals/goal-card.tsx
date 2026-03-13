"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Goal } from "@/features/goals/types";
import { cn } from "@/lib/utils";
import {
  getCategoryIcon,
  getCategoryColor,
  getStatusIcon,
  getPriorityIcon,
} from "@/features/goals/categories";
import { Heart, Pencil, Trash2, Target } from "lucide-react";

interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  showActions?: boolean;
  className?: string;
}

export function GoalCard({
  goal,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  showActions = false,
  className,
}: GoalCardProps) {
  const categoryIcon = getCategoryIcon(goal.category);
  const categoryColor = getCategoryColor(goal.category);
  const statusIcon = getStatusIcon(goal.status);
  const priorityIcon = getPriorityIcon(goal.priority);

  const daysUntilDeadline = goal.deadline
    ? Math.ceil((goal.deadline - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0;
  const isUrgent =
    daysUntilDeadline !== null &&
    daysUntilDeadline >= 0 &&
    daysUntilDeadline <= 7;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        goal.isFavorite && "border-yellow-500/50",
        goal.status === "completed" && "border-green-500/50",
        isOverdue && "border-red-500/50",
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
                {goal.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">{priorityIcon}</span>
                  {goal.priority}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <span className="mr-1">{statusIcon}</span>
                  {goal.status}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {goal.isFavorite && (
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
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Target className="w-3 h-3" /> Progress
              </span>
              <span className="font-semibold">{goal.progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all",
                  goal.progress >= 100
                    ? "bg-green-500"
                    : goal.progress >= 50
                      ? "bg-blue-500"
                      : "bg-orange-500",
                )}
                style={{ width: `${goal.progress}%` }}
              />
            </div>
          </div>

          {/* Current / Target */}
          <div className="text-sm">
            <span className="text-muted-foreground">Current:</span>{" "}
            <span className="font-medium">{goal.currentValue}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="font-medium">
              {goal.targetValue} {goal.unit}
            </span>
          </div>

          {/* Deadline */}
          {goal.deadline && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deadline:</span>
              <span
                className={cn(
                  "font-medium",
                  isOverdue && "text-red-500",
                  isUrgent && "text-orange-500",
                )}
              >
                {new Date(goal.deadline).toLocaleDateString()}
                {daysUntilDeadline !== null && (
                  <span className="ml-1">
                    (
                    {isOverdue
                      ? `${Math.abs(daysUntilDeadline)}d overdue`
                      : `${daysUntilDeadline}d left`}
                    )
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Milestones Summary */}
          {goal.milestones.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Milestones:</span>{" "}
              <span className="font-medium">
                {goal.milestones.filter((m) => m.status === "completed").length}{" "}
                / {goal.milestones.length}
              </span>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
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
                    goal.isFavorite && "fill-red-500 text-red-500",
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
