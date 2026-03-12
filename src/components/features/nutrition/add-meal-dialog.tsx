"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, Search, X } from "lucide-react";
import { createMeal, updateMeal, getFoods } from "@/features/nutrition/actions";
import {
  getDefaultFoodsByCategory,
  defaultFoods,
} from "@/features/nutrition/categories";
import type {
  MealType,
  FoodItem,
  MealFoodItem,
} from "@/features/nutrition/types";
import { calculatePortionMacros } from "@/features/nutrition/utils";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  selectedDate: string;
  editMeal?: {
    id: string;
    name: string;
    mealType: MealType;
    foods: MealFoodItem[];
    note?: string;
  } | null;
}

interface FormData {
  name: string;
  mealType: MealType;
  foods: Array<{ foodId: string; servings: number }>;
  note: string;
}

const mealTypeOptions: Array<{ value: MealType; label: string; icon: string }> =
  [
    { value: "breakfast", label: "nutrition.mealTypes.breakfast", icon: "🌅" },
    { value: "lunch", label: "nutrition.mealTypes.lunch", icon: "☀️" },
    { value: "dinner", label: "nutrition.mealTypes.dinner", icon: "🌙" },
    { value: "snack", label: "nutrition.mealTypes.snack", icon: "🍎" },
  ];

export function AddMealDialog({
  open,
  onOpenChange,
  onSuccess,
  selectedDate,
  editMeal,
}: AddMealDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [allDefaultFoods, setAllDefaultFoods] = useState<
    Array<{
      id: string;
      name: string;
      categoryId: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      servingSize: number;
    }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<
    Array<{ foodId: string; servings: number }>
  >([]);

  // Load foods on mount
  useEffect(() => {
    const loadFoods = async () => {
      const allFoods = await getFoods();
      setFoods(allFoods);

      // Load default foods from database
      const defaultFoodsList: Array<{
        id: string;
        name: string;
        categoryId: string;
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
        servingSize: number;
      }> = [];
      defaultFoods.forEach((food) => {
        defaultFoodsList.push({
          id: `default_${food.id}`,
          name: food.nameKey,
          categoryId: food.categoryId,
          calories: food.calories,
          protein: food.protein,
          fat: food.fat,
          carbs: food.carbs,
          servingSize: 100,
        });
      });
      setAllDefaultFoods(defaultFoodsList);
    };
    loadFoods();
  }, [open]);

  // Initialize form when editing
  useEffect(() => {
    if (editMeal) {
      setSelectedFoods(
        editMeal.foods.map((f) => ({
          foodId: f.foodId,
          servings: f.servings,
        })),
      );
      form.setValue("name", editMeal.name);
      form.setValue("mealType", editMeal.mealType);
      form.setValue("note", editMeal.note || "");
    } else {
      setSelectedFoods([]);
      form.reset();
    }
  }, [editMeal, open]);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      mealType: "breakfast",
      foods: [],
      note: "",
    },
  });

  // Combine custom foods and default foods for search
  const allSearchableFoods = [
    ...foods.map((f) => ({
      id: f.id,
      name: f.name,
      macros: f.macros,
      servingSize: f.servingSize,
    })),
    ...allDefaultFoods.map((f) => ({
      id: f.id,
      name: t(f.name),
      macros: {
        calories: f.calories,
        protein: f.protein,
        fat: f.fat,
        carbs: f.carbs,
      },
      servingSize: f.servingSize,
    })),
  ];

  const filteredFoods = allSearchableFoods
    .filter((food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 20); // Limit to 20 results

  const addFood = (foodId: string) => {
    if (!selectedFoods.find((f) => f.foodId === foodId)) {
      setSelectedFoods([...selectedFoods, { foodId, servings: 1 }]);
    }
    setSearchQuery("");
  };

  const removeFood = (foodId: string) => {
    setSelectedFoods(selectedFoods.filter((f) => f.foodId !== foodId));
  };

  const updateServings = (foodId: string, servings: number) => {
    setSelectedFoods(
      selectedFoods.map((f) => (f.foodId === foodId ? { ...f, servings } : f)),
    );
  };

  const getFoodById = (id: string) => {
    // First check custom foods
    const customFood = foods.find((f) => f.id === id);
    if (customFood) return customFood;

    // Then check default foods
    const defaultFoodId = id.replace("default_", "");
    const defaultFood = defaultFoods.find((f) => f.id === defaultFoodId);
    if (defaultFood) {
      return {
        id: id,
        name: t(defaultFood.nameKey),
        servingSize: 100,
        macros: {
          calories: defaultFood.calories,
          protein: defaultFood.protein,
          fat: defaultFood.fat,
          carbs: defaultFood.carbs,
        },
        isCustom: false,
      } as FoodItem;
    }

    return undefined;
  };

  const calculateTotalMacros = () => {
    let total = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    selectedFoods.forEach(({ foodId, servings }) => {
      const food = getFoodById(foodId);
      if (food) {
        const multiplier = (servings * food.servingSize) / food.servingSize;
        total.calories += Math.round(food.macros.calories * multiplier);
        total.protein += Math.round(food.macros.protein * multiplier * 10) / 10;
        total.fat += Math.round(food.macros.fat * multiplier * 10) / 10;
        total.carbs += Math.round(food.macros.carbs * multiplier * 10) / 10;
      }
    });
    return total;
  };

  const onSubmit = async (data: FormData) => {
    if (selectedFoods.length === 0) {
      setError(t("nutrition.noFoodsFound"));
      return;
    }

    setLoading(true);
    setError(null);

    const result = editMeal
      ? await updateMeal({
          id: editMeal.id,
          name: data.name,
          mealType: data.mealType,
          foods: selectedFoods,
          note: data.note,
        })
      : await createMeal({
          name:
            data.name ||
            t(
              mealTypeOptions.find((m) => m.value === data.mealType)?.label ||
                "",
            ) ||
            "Meal",
          date: selectedDate,
          mealType: data.mealType,
          foods: selectedFoods,
          note: data.note,
        });

    setLoading(false);

    if (result.success) {
      form.reset();
      setSelectedFoods([]);
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || t("common.error"));
    }
  };

  const totalMacros = calculateTotalMacros();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editMeal ? t("nutrition.editMeal") : t("nutrition.addMeal")} -{" "}
            {new Date(selectedDate).toLocaleDateString()}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Meal Type Selection */}
          <div className="space-y-2">
            <Label>{t("nutrition.mealType")}</Label>
            <Tabs
              value={form.watch("mealType")}
              onValueChange={(value) =>
                form.setValue("mealType", value as MealType)
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 gap-2 bg-transparent p-0 h-auto">
                {mealTypeOptions.map((option) => (
                  <TabsTrigger
                    key={option.value}
                    value={option.value}
                    className="flex flex-row items-center justify-center gap-2 py-2 px-3 rounded-md font-medium transition-all data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted"
                  >
                    <span className="text-lg">{option.icon}</span>
                    <span className="text-sm">{t(option.label)}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Meal Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              {t("nutrition.mealName")} ({t("common.optional") || "optional"})
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t("nutrition.mealNamePlaceholder")}
              {...form.register("name")}
            />
          </div>

          {/* Search and Add Foods */}
          <div className="space-y-2">
            <Label>{t("nutrition.addFoods")}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("nutrition.searchFoods")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Food Search Results */}
            {searchQuery && (
              <div className="border rounded-md max-h-40 overflow-y-auto">
                {filteredFoods.slice(0, 10).map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => addFood(food.id)}
                    className="w-full flex items-center justify-between p-2 hover:bg-muted border-b last:border-0"
                  >
                    <span className="text-sm">{food.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {food.macros.calories} kcal / {food.servingSize}g
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <div className="space-y-2">
              <Label>
                {t("nutrition.selectedFoods")} ({selectedFoods.length})
              </Label>
              <div className="space-y-2 border rounded-md p-3">
                {selectedFoods.map(({ foodId, servings }) => {
                  const food = getFoodById(foodId);
                  if (!food) return null;

                  return (
                    <div
                      key={foodId}
                      className="flex items-center gap-2 py-2 border-b last:border-0"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateServings(foodId, Math.max(0.5, servings - 0.5))
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-12 text-center text-sm">
                        {servings}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateServings(foodId, servings + 0.5)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="flex-1 text-sm">{food.name}</span>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {Math.round(food.macros.calories * servings)} kcal
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeFood(foodId)}
                      >
                        <span className="sr-only">Remove</span>×
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Total Macros */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-muted rounded-md">
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-500">
                    {totalMacros.calories}
                  </div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-500">
                    {totalMacros.protein}g
                  </div>
                  <div className="text-xs text-muted-foreground">protein</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-yellow-500">
                    {totalMacros.fat}g
                  </div>
                  <div className="text-xs text-muted-foreground">fat</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-500">
                    {totalMacros.carbs}g
                  </div>
                  <div className="text-xs text-muted-foreground">carbs</div>
                </div>
              </div>
            </div>
          )}

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">
              {t("nutrition.note")} ({t("common.optional") || "optional"})
            </Label>
            <Input
              id="note"
              type="text"
              placeholder={t("nutrition.notePlaceholder")}
              {...form.register("note")}
            />
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
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={loading || selectedFoods.length === 0}
            >
              {loading
                ? t("common.saving")
                : editMeal
                  ? t("common.save")
                  : t("nutrition.addMeal")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
