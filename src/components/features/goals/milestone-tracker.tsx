"use client";

import type { Milestone } from "@/features/goals/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onComplete?: (milestoneId: string) => void;
  className?: string;
}

export function MilestoneTracker({
  milestones,
  onComplete,
  className,
}: MilestoneTrackerProps) {
  if (milestones.length === 0) {
    return null;
  }

  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);

  const completedCount = milestones.filter(
    (m) => m.status === "completed",
  ).length;
  const totalCount = milestones.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Milestones</CardTitle>
          <Badge variant="secondary">
            {completedCount} / {totalCount} ({progress}%)
          </Badge>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                milestone.status === "completed" &&
                  "bg-green-500/10 border-green-500/30",
                milestone.status === "skipped" &&
                  "bg-gray-500/10 border-gray-500/30",
              )}
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {milestone.status === "completed" && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {milestone.status === "skipped" && (
                  <XCircle className="w-5 h-5 text-gray-500" />
                )}
                {milestone.status === "pending" && (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium truncate",
                    milestone.status === "completed" &&
                      "line-through text-muted-foreground",
                  )}
                >
                  {milestone.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {milestone.currentValue} / {milestone.targetValue}{" "}
                    {milestone.unit}
                  </span>
                  {milestone.deadline && (
                    <span>
                      • Due: {new Date(milestone.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="flex-shrink-0 w-24">
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      milestone.status === "completed"
                        ? "bg-green-500"
                        : milestone.currentValue > 0
                          ? "bg-blue-500"
                          : "bg-secondary",
                    )}
                    style={{
                      width: `${milestone.targetValue > 0 ? (milestone.currentValue / milestone.targetValue) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Complete Button */}
              {milestone.status === "pending" && onComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onComplete(milestone.id)}
                >
                  Complete
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
