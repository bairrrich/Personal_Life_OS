"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Minus, Search, X, Trash2 } from "lucide-react";
import { getFoods } from "@/features/nutrition/actions";
import {
  createRecipe,
  updateRecipe,
} from "@/features/nutrition/recipe-actions";
import { defaultFoods } from "@/features/nutrition/categories";
import type { Recipe, RecipeIngredient } from "@/features/nutrition/types";
import { calculatePortionMacros } from "@/features/nutrition/utils";

interface AddRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editRecipe?: Recipe | null;
}

interface IngredientItem {
  foodId: string;
  servings: number;
}

interface FormData {
  name: string;
  description: string;
  ingredients: IngredientItem[];
  servings: number;
  prepTime: number;
  cookTime: number;
  instructions: string;
  tags: string;
}

export function AddRecipeDialog({
  open,
  onOpenChange,
  onSuccess,
  editRecipe,
}: AddRecipeDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foods, setFoods] = useState<
    Array<{
      id: string;
      name: string;
      macros: { calories: number; protein: number; fat: number; carbs: number };
      servingSize: number;
    }>
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<
    IngredientItem[]
  >([]);

  // Load foods on mount
  useEffect(() => {
    const loadFoods = async () => {
      const allFoods = await getFoods();

      const searchableFoods = [
        ...allFoods.map((f) => ({
          id: f.id,
          name: f.name,
          macros: f.macros,
          servingSize: f.servingSize,
        })),
        ...defaultFoods.map((f) => ({
          id: `default_${f.id}`,
          name: t(f.nameKey),
          macros: {
            calories: f.calories,
            protein: f.protein,
            fat: f.fat,
            carbs: f.carbs,
          },
          servingSize: 100,
        })),
      ];

      setFoods(searchableFoods);
    };
    loadFoods();
  }, [open, t]);

  // Initialize form when editing
  useEffect(() => {
    if (editRecipe) {
      setSelectedIngredients(
        editRecipe.ingredients.map((ing) => ({
          foodId: ing.foodId,
          servings: ing.servings,
        })),
      );
      form.setValue("name", editRecipe.name);
      form.setValue("description", editRecipe.description || "");
      form.setValue("servings", editRecipe.servings);
      form.setValue("prepTime", editRecipe.prepTime || 0);
      form.setValue("cookTime", editRecipe.cookTime || 0);
      form.setValue("instructions", editRecipe.instructions?.join("\n") || "");
      form.setValue("tags", editRecipe.tags?.join(", ") || "");
    } else {
      setSelectedIngredients([]);
      form.reset();
    }
  }, [editRecipe, open]);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      ingredients: [],
      servings: 1,
      prepTime: 0,
      cookTime: 0,
      instructions: "",
      tags: "",
    },
  });

  const filteredFoods = foods
    .filter((food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .slice(0, 20);

  const addIngredient = (foodId: string) => {
    if (!selectedIngredients.find((f) => f.foodId === foodId)) {
      setSelectedIngredients([...selectedIngredients, { foodId, servings: 1 }]);
    }
    setSearchQuery("");
  };

  const removeIngredient = (foodId: string) => {
    setSelectedIngredients(
      selectedIngredients.filter((f) => f.foodId !== foodId),
    );
  };

  const updateServings = (foodId: string, servings: number) => {
    setSelectedIngredients(
      selectedIngredients.map((f) =>
        f.foodId === foodId ? { ...f, servings } : f,
      ),
    );
  };

  const getFoodById = (id: string) => {
    const customFood = foods.find((f) => f.id === id);
    if (customFood) return customFood;

    const defaultFoodId = id.replace("default_", "");
    const defaultFood = defaultFoods.find((f) => f.id === defaultFoodId);
    if (defaultFood) {
      return {
        id: id,
        name: t(defaultFood.nameKey),
        macros: {
          calories: defaultFood.calories,
          protein: defaultFood.protein,
          fat: defaultFood.fat,
          carbs: defaultFood.carbs,
        },
        servingSize: 100,
      };
    }

    return undefined;
  };

  const calculateTotalMacros = () => {
    let total = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    selectedIngredients.forEach(({ foodId, servings }) => {
      const food = getFoodById(foodId);
      if (food) {
        const macros = calculatePortionMacros(food, servings);
        total.calories += macros.calories;
        total.protein += macros.protein;
        total.fat += macros.fat;
        total.carbs += macros.carbs;
      }
    });
    return total;
  };

  const onSubmit = async (data: FormData) => {
    if (selectedIngredients.length === 0) {
      setError("Please add at least one ingredient");
      return;
    }

    setLoading(true);
    setError(null);

    const instructionsArray = data.instructions
      .split("\n")
      .filter((line) => line.trim().length > 0);

    const tagsArray = data.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const result = editRecipe
      ? await updateRecipe({
          id: editRecipe.id,
          name: data.name,
          description: data.description || undefined,
          ingredients: selectedIngredients,
          servings: data.servings,
          prepTime: data.prepTime || undefined,
          cookTime: data.cookTime || undefined,
          instructions:
            instructionsArray.length > 0 ? instructionsArray : undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        })
      : await createRecipe({
          name: data.name,
          description: data.description || undefined,
          ingredients: selectedIngredients,
          servings: data.servings,
          prepTime: data.prepTime || undefined,
          cookTime: data.cookTime || undefined,
          instructions:
            instructionsArray.length > 0 ? instructionsArray : undefined,
          tags: tagsArray.length > 0 ? tagsArray : undefined,
        });

    setLoading(false);

    if (result.success) {
      form.reset();
      setSelectedIngredients([]);
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || t("common.error"));
    }
  };

  const totalMacros = calculateTotalMacros();
  const servings = form.watch("servings") || 1;
  const macrosPerServing = {
    calories: Math.round(totalMacros.calories / servings),
    protein: Math.round((totalMacros.protein / servings) * 10) / 10,
    fat: Math.round((totalMacros.fat / servings) * 10) / 10,
    carbs: Math.round((totalMacros.carbs / servings) * 10) / 10,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editRecipe ? t("nutrition.editRecipe") : t("nutrition.addRecipe")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Recipe Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("nutrition.recipeName")} *</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("nutrition.recipeNamePlaceholder")}
              {...form.register("name", { required: true })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("nutrition.recipeDescription")}
            </Label>
            <Textarea
              id="description"
              placeholder={t("nutrition.recipeDescriptionPlaceholder")}
              className="min-h-[60px]"
              {...form.register("description")}
            />
          </div>

          {/* Prep Time and Cook Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prepTime">{t("nutrition.prepTime")} (min)</Label>
              <Input
                id="prepTime"
                type="number"
                min="0"
                {...form.register("prepTime", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookTime">{t("nutrition.cookTime")} (min)</Label>
              <Input
                id="cookTime"
                type="number"
                min="0"
                {...form.register("cookTime", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Servings */}
          <div className="space-y-2">
            <Label htmlFor="servings">{t("nutrition.servings")} *</Label>
            <Input
              id="servings"
              type="number"
              min="1"
              {...form.register("servings", { valueAsNumber: true, min: 1 })}
            />
          </div>

          {/* Search and Add Ingredients */}
          <div className="space-y-2">
            <Label>{t("nutrition.addIngredients")}</Label>
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
                {filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => addIngredient(food.id)}
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

          {/* Selected Ingredients */}
          {selectedIngredients.length > 0 && (
            <div className="space-y-2">
              <Label>
                {t("nutrition.ingredients")} ({selectedIngredients.length})
              </Label>
              <div className="space-y-2 border rounded-md p-3">
                {selectedIngredients.map(({ foodId, servings }) => {
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
                        onClick={() => removeIngredient(foodId)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {/* Total Macros */}
              <div className="grid grid-cols-5 gap-2 p-3 bg-muted rounded-md">
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-sm font-bold text-orange-500">
                    {totalMacros.calories}
                  </div>
                  <div className="text-[10px] text-muted-foreground">kcal</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-500">
                    {totalMacros.protein}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">P</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-yellow-500">
                    {totalMacros.fat}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">F</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-green-500">
                    {totalMacros.carbs}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">C</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">
                    Per Serving
                  </div>
                  <div className="text-sm font-bold text-orange-500">
                    {macrosPerServing.calories}
                  </div>
                  <div className="text-[10px] text-muted-foreground">kcal</div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">{t("nutrition.instructions")}</Label>
            <Textarea
              id="instructions"
              placeholder={t("nutrition.instructionsPlaceholder")}
              className="min-h-[100px]"
              {...form.register("instructions")}
            />
            <p className="text-xs text-muted-foreground">
              {t("nutrition.instructionsHint")}
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t("nutrition.tags")}</Label>
            <Input
              id="tags"
              type="text"
              placeholder={t("nutrition.tagsPlaceholder")}
              {...form.register("tags")}
            />
            <p className="text-xs text-muted-foreground">
              {t("nutrition.tagsHint")}
            </p>
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
              disabled={loading || selectedIngredients.length === 0}
            >
              {loading
                ? t("common.saving")
                : editRecipe
                  ? t("common.save")
                  : t("nutrition.addRecipe")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
