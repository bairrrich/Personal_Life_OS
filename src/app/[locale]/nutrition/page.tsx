"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Utensils,
  Apple,
  ChevronDown,
  X,
  BookOpen,
} from "lucide-react";
import {
  MealCard,
  FoodCard,
  RecipeCard,
  AddMealDialog,
  AddFoodDialog,
  AddRecipeDialog,
  DailyLogSummary,
  WaterTracker,
} from "@/components/features/nutrition";
import {
  getDailyLog,
  getFoods,
  getNutritionSummary,
  deleteMeal,
  deleteFood,
} from "@/features/nutrition/actions";
import { getRecipes, deleteRecipe } from "@/features/nutrition/recipe-actions";
import type {
  Meal,
  FoodItem,
  NutritionSummary,
  Recipe,
} from "@/features/nutrition/types";
import {
  foodCategories,
  getDefaultFoodsByCategory,
  getDefaultFoodById,
} from "@/features/nutrition/categories";

export default function NutritionPage() {
  const t = useTranslations();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [activeTab, setActiveTab] = useState<"diary" | "foods" | "recipes">(
    "diary",
  );
  const [meals, setMeals] = useState<Meal[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [defaultFoods, setDefaultFoods] = useState<
    Array<{
      id: string;
      name: string;
      categoryId: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    }>
  >([]);
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [recipeSearchQuery, setRecipeSearchQuery] = useState("");

  // Dialogs
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [addFoodOpen, setAddFoodOpen] = useState(false);
  const [addRecipeOpen, setAddRecipeOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  // Load data
  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    const [dailyLog, allFoods, nutritionSummary, allRecipes] =
      await Promise.all([
        getDailyLog(selectedDate),
        getFoods(),
        getNutritionSummary(selectedDate),
        getRecipes(),
      ]);

    setMeals(dailyLog.meals);
    setFoods(allFoods);
    setRecipes(allRecipes);
    setSummary(nutritionSummary);

    // Load default foods
    const allDefaultFoods: Array<{
      id: string;
      name: string;
      categoryId: string;
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
    }> = [];
    foodCategories.forEach((cat) => {
      const catFoods = getDefaultFoodsByCategory(cat.id);
      catFoods.forEach((food) => {
        allDefaultFoods.push({
          id: food.id,
          name: food.nameKey,
          categoryId: food.categoryId,
          calories: food.calories,
          protein: food.protein,
          fat: food.fat,
          carbs: food.carbs,
        });
      });
    });
    setDefaultFoods(allDefaultFoods);
  };

  const handleDeleteMeal = async (mealId: string) => {
    if (confirm(t("nutrition.confirmDeleteMeal"))) {
      await deleteMeal(mealId);
      loadData();
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    if (confirm(t("nutrition.confirmDeleteFood"))) {
      await deleteFood(foodId);
      loadData();
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (confirm(t("nutrition.confirmDeleteRecipe"))) {
      await deleteRecipe(recipeId);
      loadData();
    }
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setAddMealOpen(true);
  };

  const handleEditFood = (food: FoodItem) => {
    setEditingFood(food);
    setAddFoodOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setAddRecipeOpen(true);
  };

  const filteredFoods = foods.filter((food) =>
    food.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(recipeSearchQuery.toLowerCase()),
  );

  const filteredDefaultFoods = defaultFoods.filter((food) => {
    const matchesSearch = food.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || food.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout>
      <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold">
              {t("nutrition.title")}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t("nutrition.description")}
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
        </div>

        {/* Summary Card */}
        {summary && <DailyLogSummary summary={summary} />}

        {/* Water Tracker */}
        <WaterTracker date={selectedDate} />

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "diary" | "foods" | "recipes")
          }
        >
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 h-auto">
            <TabsTrigger
              value="diary"
              className="flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium transition-all data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted"
            >
              <Utensils className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("nutrition.foodDiary")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="foods"
              className="flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium transition-all data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted"
            >
              <Apple className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("nutrition.foodsDatabase")}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="recipes"
              className="flex items-center justify-center gap-2 py-3 px-2 rounded-lg font-medium transition-all data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">{t("nutrition.recipes")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Food Diary Tab */}
          <TabsContent value="diary" className="space-y-4 w-full pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl font-semibold">Meals</h2>
              <Button
                onClick={() => {
                  setEditingMeal(null);
                  setAddMealOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="sm:inline">{t("nutrition.addMeal")}</span>
              </Button>
            </div>

            {meals.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-lg font-medium">{t("nutrition.noMeals")}</p>
                <p className="text-muted-foreground mt-2">
                  {t("nutrition.startTracking")}
                </p>
                <Button className="mt-4" onClick={() => setAddMealOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("nutrition.addMeal")}
                </Button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onEdit={() => handleEditMeal(meal)}
                    onDelete={() => handleDeleteMeal(meal.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Foods Database Tab */}
          <TabsContent value="foods" className="space-y-4 w-full pt-4">
            {/* Search and Add Button */}
            <div className="flex flex-col gap-3 w-full">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={t("nutrition.searchFoods")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9 w-full"
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
              <Button
                onClick={() => {
                  setEditingFood(null);
                  setAddFoodOpen(true);
                }}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("nutrition.addCustomFood")}
              </Button>
            </div>

            {/* Category Filter - Dropdown */}
            <div className="w-full">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {foodCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{t(cat.nameKey)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Default Foods */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold">
                {t("nutrition.defaultFoods")}
              </h3>
              {filteredDefaultFoods.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("nutrition.noFoodsFound")}
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredDefaultFoods.map((food) => (
                    <GlassCard key={food.id} className="w-full">
                      <div className="p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                          <h4
                            className="font-medium text-sm capitalize truncate w-full sm:w-auto"
                            title={t(
                              `nutrition.foods.${food.id.replace("nutrition.foods.", "")}`,
                            )}
                          >
                            {t(
                              `nutrition.foods.${food.id.replace("nutrition.foods.", "")}`,
                            )}
                          </h4>
                          <div className="grid grid-cols-4 gap-3 text-xs shrink-0">
                            <div className="text-center">
                              <div className="font-bold text-orange-500 text-sm">
                                {food.calories}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                kcal
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-blue-500 text-sm">
                                {food.protein}g
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                P
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-yellow-500 text-sm">
                                {food.fat}g
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                F
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-500 text-sm">
                                {food.carbs}g
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                C
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Foods */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-base font-semibold">
                {t("nutrition.customFoods")}
              </h3>
              {filteredFoods.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t("nutrition.noCustomFoods")}
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredFoods.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onEdit={() => handleEditFood(food)}
                      onDelete={() => handleDeleteFood(food.id)}
                      showActions
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Recipes Tab */}
          <TabsContent value="recipes" className="space-y-4 w-full pt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl font-semibold">
                {t("nutrition.recipes")}
              </h2>
              <Button
                onClick={() => {
                  setEditingRecipe(null);
                  setAddRecipeOpen(true);
                }}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="sm:inline">{t("nutrition.addRecipe")}</span>
              </Button>
            </div>

            {/* Recipe Search */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t("nutrition.searchFoods")}
                value={recipeSearchQuery}
                onChange={(e) => setRecipeSearchQuery(e.target.value)}
                className="pl-9 pr-9 w-full"
              />
              {recipeSearchQuery && (
                <button
                  type="button"
                  onClick={() => setRecipeSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-lg font-medium">
                  {t("nutrition.noRecipes")}
                </p>
                <p className="text-muted-foreground mt-2">
                  {t("nutrition.startCooking")}
                </p>
                <Button className="mt-4" onClick={() => setAddRecipeOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("nutrition.addRecipe")}
                </Button>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onEdit={() => handleEditRecipe(recipe)}
                    onDelete={() => handleDeleteRecipe(recipe.id)}
                    showActions
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddMealDialog
        open={addMealOpen}
        onOpenChange={setAddMealOpen}
        onSuccess={loadData}
        selectedDate={selectedDate}
        editMeal={editingMeal}
      />
      <AddFoodDialog
        open={addFoodOpen}
        onOpenChange={setAddFoodOpen}
        onSuccess={loadData}
        editFood={editingFood}
      />
      <AddRecipeDialog
        open={addRecipeOpen}
        onOpenChange={setAddRecipeOpen}
        onSuccess={loadData}
        editRecipe={editingRecipe}
      />
    </AppLayout>
  );
}
