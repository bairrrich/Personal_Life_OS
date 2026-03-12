"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { NutritionSummary } from "@/features/nutrition/types";
import { cn } from "@/lib/utils";

interface DailyLogSummaryProps {
  summary: NutritionSummary;
  className?: string;
}

export function DailyLogSummary({ summary, className }: DailyLogSummaryProps) {
  const t = useTranslations();

  const macroItems = [
    {
      label: t("nutrition.calories"),
      value: summary.totalCalories,
      goal: summary.calorieGoal,
      remaining: summary.caloriesRemaining,
      color: "text-orange-500",
      bgColor: "bg-orange-500",
      unit: "kcal",
    },
    {
      label: t("nutrition.protein"),
      value: summary.totalProtein,
      goal: summary.proteinGoal,
      remaining: summary.proteinGoal - summary.totalProtein,
      color: "text-blue-500",
      bgColor: "bg-blue-500",
      unit: "g",
    },
    {
      label: t("nutrition.fat"),
      value: summary.totalFat,
      goal: summary.fatGoal,
      remaining: summary.fatGoal - summary.totalFat,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500",
      unit: "g",
    },
    {
      label: t("nutrition.carbs"),
      value: summary.totalCarbs,
      goal: summary.carbsGoal,
      remaining: summary.carbsGoal - summary.totalCarbs,
      color: "text-green-500",
      bgColor: "bg-green-500",
      unit: "g",
    },
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-xl">{t("nutrition.todaySummary")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        {/* Calories - Main Highlight */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm font-medium">{macroItems[0].label}</span>
            <span className="text-sm text-muted-foreground">
              {summary.totalCalories} / {summary.calorieGoal}{" "}
              {macroItems[0].unit}
            </span>
          </div>
          <Progress
            value={Math.min(100, summary.progress.calories)}
            className={cn(
              "h-3",
              summary.progress.calories > 100 && "bg-red-100",
            )}
            indicatorClassName={cn(
              summary.progress.calories > 100
                ? "bg-red-500"
                : macroItems[0].bgColor,
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {summary.caloriesRemaining > 0
                ? `${summary.caloriesRemaining} ${t("nutrition.remaining")}`
                : `${Math.abs(summary.caloriesRemaining)} ${t("nutrition.over")}`}
            </span>
            <span>{Math.round(summary.progress.calories)}%</span>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {macroItems.slice(1).map((macro) => (
            <div key={macro.label} className="space-y-1 sm:space-y-2">
              <div className="text-xs sm:text-sm font-medium">
                {macro.label}
              </div>
              <div
                className={cn("text-base sm:text-xl font-bold", macro.color)}
              >
                {macro.value}
                <span className="text-xs sm:text-sm text-muted-foreground ml-0.5 sm:ml-1">
                  {macro.unit}
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                of {macro.goal} {macro.unit}
              </div>
              <Progress
                value={Math.min(
                  100,
                  macro.goal > 0 ? (macro.value / macro.goal) * 100 : 0,
                )}
                className="h-1.5 sm:h-2"
                indicatorClassName={macro.bgColor}
              />
            </div>
          ))}
        </div>

        {/* Water Intake */}
        <div className="space-y-2 pt-4 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-sm font-medium">
              💧 {t("nutrition.waterIntake")}
            </span>
            <span className="text-sm text-muted-foreground">
              {summary.totalWater} / {summary.waterGoal} ml
            </span>
          </div>
          <Progress
            value={Math.min(100, summary.progress.water)}
            className="h-3"
            indicatorClassName="bg-cyan-500"
          />
          <div className="text-xs text-muted-foreground text-right">
            {Math.round(summary.progress.water)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
