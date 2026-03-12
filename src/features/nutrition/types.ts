// Nutrition Module Types

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface NutritionMacros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  servingSize: number; // in grams
  macros: NutritionMacros;
  barcode?: string;
  brand?: string;
  category?: string;
  isCustom?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

export interface MealFoodItem {
  foodId: string;
  servings: number; // number of servings
  totalGrams: number;
  macros: NutritionMacros; // calculated for this portion
}

export interface Meal {
  id: string;
  name: string;
  date: number; // timestamp
  mealType: MealType;
  foods: MealFoodItem[];
  totalMacros: NutritionMacros;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DailyNutritionLog {
  date: string; // ISO date string (YYYY-MM-DD)
  meals: Meal[];
  totalMacros: NutritionMacros;
  waterIntake: number; // in ml
  createdAt: number;
  updatedAt: number;
}

export interface NutritionGoal {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number; // in ml
  createdAt: number;
  updatedAt: number;
}

export interface NutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  totalWater: number;
  calorieGoal: number;
  proteinGoal: number;
  fatGoal: number;
  carbsGoal: number;
  waterGoal: number;
  caloriesRemaining: number;
  progress: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    water: number;
  };
}

export interface CreateFoodInput {
  name: string;
  servingSize: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
  barcode?: string;
  brand?: string;
  category?: string;
}

export interface CreateMealInput {
  name: string;
  date: string; // ISO date string
  mealType: MealType;
  foods: Array<{
    foodId: string;
    servings: number;
  }>;
  note?: string;
}

export interface UpdateMealInput {
  id: string;
  name?: string;
  mealType?: MealType;
  foods?: Array<{
    foodId: string;
    servings: number;
  }>;
  note?: string;
}

export interface CreateDailyLogInput {
  date: string;
  waterIntake?: number;
}

export interface CreateNutritionGoalInput {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  water: number;
}

export interface UpdateNutritionGoalInput {
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  water?: number;
}

export interface RecipeIngredient {
  foodId: string;
  servings: number;
  totalGrams: number;
  macros: NutritionMacros;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  totalMacros: NutritionMacros;
  servings: number; // количество порций в рецепте
  prepTime?: number; // время приготовления в минутах
  cookTime?: number; // время готовки в минутах
  instructions?: string[]; // шаги приготовления
  tags?: string[];
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateRecipeInput {
  name: string;
  description?: string;
  ingredients: Array<{
    foodId: string;
    servings: number;
  }>;
  servings: number;
  prepTime?: number;
  cookTime?: number;
  instructions?: string[];
  tags?: string[];
}

export interface UpdateRecipeInput {
  id: string;
  name?: string;
  description?: string;
  ingredients?: Array<{
    foodId: string;
    servings: number;
  }>;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  instructions?: string[];
  tags?: string[];
}
