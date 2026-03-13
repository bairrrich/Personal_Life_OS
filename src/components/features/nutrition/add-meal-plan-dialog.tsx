"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import {
  createMealPlan,
  updateMealPlan,
  getMealPlans,
} from "@/features/nutrition/meal-plan-actions";
import {
  createDefaultDayPlans,
  getWeekStart,
} from "@/features/nutrition/meal-plan-utils";
import { getRecipes } from "@/features/nutrition/recipe-actions";
import type {
  MealPlan,
  DayPlan,
  PlannedMeal,
} from "@/features/nutrition/types";

interface AddMealPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editMealPlan?: MealPlan | null;
}

export function AddMealPlanDialog({
  open,
  onOpenChange,
  onSuccess,
  editMealPlan,
}: AddMealPlanDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [days, setDays] = useState<DayPlan[]>([]);
  const [recipes, setRecipes] = useState<Array<{ id: string; name: string }>>(
    [],
  );

  // Load recipes on mount
  useEffect(() => {
    const loadRecipes = async () => {
      const allRecipes = await getRecipes();
      setRecipes(allRecipes.map((r) => ({ id: r.id, name: r.name })));
    };
    loadRecipes();
  }, [open]);

  // Initialize form when editing
  useEffect(() => {
    if (editMealPlan) {
      setName(editMealPlan.name);
      setWeekStart(editMealPlan.weekStart);
      setDays(editMealPlan.days);
    } else {
      const today = new Date();
      const weekStart = getWeekStart(today);
      const weekStartStr = weekStart.toISOString().split("T")[0];

      setName(`Meal Plan - ${weekStartStr}`);
      setWeekStart(weekStartStr);
      setDays(createDefaultDayPlans(weekStartStr));
    }
  }, [editMealPlan, open]);

  const updateDayMeal = (
    dayIndex: number,
    mealType: "breakfast" | "lunch" | "dinner",
    recipeId: string,
  ) => {
    const newDays = [...days];
    newDays[dayIndex] = {
      ...newDays[dayIndex],
      [mealType]:
        recipeId && recipeId !== "none" ? { recipeId, mealType } : undefined,
    };
    setDays(newDays);
  };

  const updateDayNote = (dayIndex: number, note: string) => {
    const newDays = [...days];
    newDays[dayIndex] = { ...newDays[dayIndex], note };
    setDays(newDays);
  };

  const onSubmit = async () => {
    if (!name || !weekStart) {
      setError("Please fill in required fields");
      return;
    }

    setLoading(true);
    setError(null);

    const result = editMealPlan
      ? await updateMealPlan({
          id: editMealPlan.id,
          name,
          days,
        })
      : await createMealPlan({
          name,
          weekStart,
          days,
        });

    setLoading(false);

    if (result.success) {
      setName("");
      setWeekStart("");
      setDays([]);
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || "Failed to save meal plan");
    }
  };

  const dayNames: Record<string, string> = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMealPlan ? "Edit Meal Plan" : "Create Meal Plan"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Name and Week Start */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Weekly Meal Plan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekStart">Week Start (Monday) *</Label>
              <Input
                id="weekStart"
                type="date"
                value={weekStart}
                onChange={(e) => {
                  setWeekStart(e.target.value);
                  setDays(createDefaultDayPlans(e.target.value));
                }}
              />
            </div>
          </div>

          {/* Days */}
          <div className="space-y-4">
            <Label>Daily Meals</Label>
            {days.map((day, dayIndex) => (
              <div key={day.day} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold w-24">
                    {dayNames[day.day]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {day.date}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Breakfast */}
                  <div className="space-y-1">
                    <Label className="text-xs">🌅 Breakfast</Label>
                    <Select
                      value={day.breakfast?.recipeId || "none"}
                      onValueChange={(value) =>
                        updateDayMeal(dayIndex, "breakfast", value)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No meal</SelectItem>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lunch */}
                  <div className="space-y-1">
                    <Label className="text-xs">☀️ Lunch</Label>
                    <Select
                      value={day.lunch?.recipeId || "none"}
                      onValueChange={(value) =>
                        updateDayMeal(dayIndex, "lunch", value)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No meal</SelectItem>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dinner */}
                  <div className="space-y-1">
                    <Label className="text-xs">🌙 Dinner</Label>
                    <Select
                      value={day.dinner?.recipeId || "none"}
                      onValueChange={(value) =>
                        updateDayMeal(dayIndex, "dinner", value)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select recipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No meal</SelectItem>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe.id} value={recipe.id}>
                            {recipe.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Day Note */}
                <div className="space-y-1">
                  <Label className="text-xs">Day Note</Label>
                  <Textarea
                    placeholder="Add a note for this day..."
                    value={day.note || ""}
                    onChange={(e) => updateDayNote(dayIndex, e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={onSubmit} disabled={loading}>
              {loading ? "Saving..." : editMealPlan ? "Update" : "Create Plan"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
