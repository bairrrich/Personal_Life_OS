"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getNutritionSummary,
  type NutritionSummary as NutritionSummaryType,
} from "@/features/nutrition";
import { cn } from "@/lib/utils";

export function NutritionSummaryWidget() {
  const t = useTranslations();
  const [summary, setSummary] = useState<NutritionSummaryType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      const today = new Date().toISOString().split("T")[0];
      const data = await getNutritionSummary(today);
      setSummary(data);
      setLoading(false);
    };
    loadSummary();
  }, []);

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {t("nutrition.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {t("nutrition.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {t("common.noData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  const calorieProgress = Math.min(100, summary.progress.calories);
  const isOverCalories = summary.progress.calories > 100;

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {t("nutrition.todaySummary")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Calories */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{t("nutrition.calories")}</span>
            <span className={cn("font-bold", isOverCalories && "text-red-500")}>
              {summary.totalCalories} / {summary.calorieGoal}
            </span>
          </div>
          <Progress
            value={calorieProgress}
            className={cn("h-2", isOverCalories && "bg-red-100")}
            indicatorClassName={cn(
              isOverCalories ? "bg-red-500" : "bg-orange-500",
            )}
          />
          <div className="text-xs text-muted-foreground text-right">
            {summary.caloriesRemaining > 0
              ? `${summary.caloriesRemaining} ${t("nutrition.remaining")}`
              : `${Math.abs(summary.caloriesRemaining)} ${t("nutrition.over")}`}
          </div>
        </div>

        {/* Macros Mini Grid */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">
              {summary.totalProtein}g
            </div>
            <div className="text-xs text-muted-foreground">
              {t("nutrition.protein")}
            </div>
            <Progress
              value={Math.min(100, summary.progress.protein)}
              className="h-1 mt-1"
              indicatorClassName="bg-blue-500"
            />
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">
              {summary.totalFat}g
            </div>
            <div className="text-xs text-muted-foreground">
              {t("nutrition.fat")}
            </div>
            <Progress
              value={Math.min(100, summary.progress.fat)}
              className="h-1 mt-1"
              indicatorClassName="bg-yellow-500"
            />
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {summary.totalCarbs}g
            </div>
            <div className="text-xs text-muted-foreground">
              {t("nutrition.carbs")}
            </div>
            <Progress
              value={Math.min(100, summary.progress.carbs)}
              className="h-1 mt-1"
              indicatorClassName="bg-green-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
