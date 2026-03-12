"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Meal, MealType } from "@/features/nutrition/types";
import { cn } from "@/lib/utils";

interface MealCardProps {
  meal: Meal;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const mealTypeIcons: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

const mealTypeColors: Record<MealType, string> = {
  breakfast: "bg-orange-500",
  lunch: "bg-blue-500",
  dinner: "bg-purple-500",
  snack: "bg-green-500",
};

export function MealCard({ meal, onEdit, onDelete, className }: MealCardProps) {
  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mealTypeIcons[meal.mealType]}</span>
            <div>
              <CardTitle className="text-lg">{meal.name}</CardTitle>
              <Badge className={cn("mt-1", mealTypeColors[meal.mealType])}>
                {mealTypeLabels[meal.mealType]}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">
              {meal.totalMacros.calories}
            </div>
            <div className="text-xs text-muted-foreground">kcal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">
              {meal.totalMacros.protein}g
            </div>
            <div className="text-xs text-muted-foreground">protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">
              {meal.totalMacros.fat}g
            </div>
            <div className="text-xs text-muted-foreground">fat</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {meal.totalMacros.carbs}g
            </div>
            <div className="text-xs text-muted-foreground">carbs</div>
          </div>
        </div>

        {meal.foods.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              Foods ({meal.foods.length})
            </div>
            <div className="space-y-1">
              {meal.foods.map((foodItem, index) => (
                <div
                  key={index}
                  className="flex justify-between text-sm py-1 border-b last:border-0"
                >
                  <span className="text-muted-foreground">
                    {foodItem.totalGrams}g
                  </span>
                  <span className="flex-1 mx-2">
                    {foodItem.macros.calories} kcal
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {meal.note && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground italic">{meal.note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
