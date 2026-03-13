"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MealPlan, DayPlan } from "@/features/nutrition/types";
import { cn } from "@/lib/utils";
import { Calendar, Clock, Utensils, Trash2, Edit2 } from "lucide-react";

interface WeeklyMealPlanProps {
  mealPlan: MealPlan;
  recipes?: Array<{ id: string; name: string; image?: string }>;
  onEdit?: () => void;
  onDelete?: () => void;
  onDayClick?: (day: DayPlan) => void;
  className?: string;
}

const dayNames: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const dayNamesShort: Record<string, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const mealTypeIcons: Record<string, string> = {
  breakfast: "🌅",
  lunch: "☀️",
  dinner: "🌙",
  snack: "🍎",
};

export function WeeklyMealPlan({
  mealPlan,
  recipes = [],
  onEdit,
  onDelete,
  onDayClick,
  className,
}: WeeklyMealPlanProps) {
  const getRecipeName = (recipeId?: string) => {
    if (!recipeId) return "No meal planned";
    const recipe = recipes.find((r) => r.id === recipeId);
    return recipe?.name || "Unknown recipe";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{mealPlan.name}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDate(mealPlan.weekStart)} -{" "}
                  {formatDate(mealPlan.weekEnd)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>7 days</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="outline" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-1 text-destructive" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {mealPlan.days.map((day) => (
            <DayPlanCard
              key={day.day}
              day={day}
              recipes={recipes}
              getRecipeName={getRecipeName}
              onClick={() => onDayClick?.(day)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface DayPlanCardProps {
  day: DayPlan;
  recipes: Array<{ id: string; name: string; image?: string }>;
  getRecipeName: (recipeId?: string) => string;
  onClick?: () => void;
}

function DayPlanCard({
  day,
  recipes,
  getRecipeName,
  onClick,
}: DayPlanCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const meals = [
    { type: "breakfast" as const, meal: day.breakfast },
    { type: "lunch" as const, meal: day.lunch },
    { type: "dinner" as const, meal: day.dinner },
    ...(day.snacks?.map((snack) => ({ type: "snack" as const, meal: snack })) ||
      []),
  ].filter((m) => m.meal);

  const hasMeals = meals.length > 0 || day.note;

  return (
    <div
      className={cn(
        "border rounded-lg p-4 transition-colors",
        hasMeals ? "bg-muted/30" : "bg-muted/10",
        onClick && "cursor-pointer hover:bg-muted/50",
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="w-16 justify-center">
            {dayNamesShort[day.day]}
          </Badge>
          <span className="text-sm font-medium">{formatDate(day.date)}</span>
        </div>
      </div>

      {hasMeals ? (
        <div className="space-y-2">
          {meals.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <span className="text-lg">{mealTypeIcons[item.type]}</span>
              <span className="text-muted-foreground capitalize w-20">
                {item.type}
              </span>
              <span className="flex-1">
                {getRecipeName(item.meal?.recipeId)}
              </span>
              {item.meal?.note && (
                <Badge variant="outline" className="text-xs">
                  📝
                </Badge>
              )}
            </div>
          ))}
          {day.note && (
            <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
              📌 {day.note}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic">
          <Utensils className="h-4 w-4 inline mr-1" />
          No meals planned
        </div>
      )}
    </div>
  );
}
