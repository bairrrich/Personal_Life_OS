"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
  queryEntities,
} from "@/entity-engine/engine";
import type { FoodEntity, MealEntity } from "@/entity-engine/types";
import type {
  FoodItem,
  Meal,
  MealFoodItem,
  DailyNutritionLog,
  NutritionGoal,
  NutritionSummary,
  CreateFoodInput,
  CreateMealInput,
  UpdateMealInput,
  CreateNutritionGoalInput,
  UpdateNutritionGoalInput,
  NutritionMacros,
} from "./types";
import { calculatePortionMacros } from "./utils";

export async function createFood(
  input: CreateFoodInput,
): Promise<{ success: boolean; data?: FoodItem; error?: string }> {
  "use server";
  try {
    const now = Date.now();

    const id = await createEntity<FoodEntity>({
      type: "food",
      name: input.name,
      data: {
        calories: input.calories,
        protein: input.protein,
        fat: input.fat,
        carbs: input.carbs,
        fiber: input.fiber,
        sugar: input.sugar,
        barcode: input.barcode,
        brand: input.brand,
        servingSize: input.servingSize,
      },
    });

    revalidatePath("/nutrition");

    const food: FoodItem = {
      id,
      name: input.name,
      servingSize: input.servingSize,
      macros: {
        calories: input.calories,
        protein: input.protein,
        fat: input.fat,
        carbs: input.carbs,
        fiber: input.fiber,
        sugar: input.sugar,
      },
      barcode: input.barcode,
      brand: input.brand,
      category: input.category,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: food };
  } catch (error) {
    console.error("Failed to create food:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing food item
 */
export async function updateFood(
  id: string,
  input: Partial<CreateFoodInput>,
): Promise<{ success: boolean; data?: FoodItem; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "food") {
      return { success: false, error: "Food not found" };
    }

    const foodEntity = entity as FoodEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.calories !== undefined) updateData.calories = input.calories;
    if (input.protein !== undefined) updateData.protein = input.protein;
    if (input.fat !== undefined) updateData.fat = input.fat;
    if (input.carbs !== undefined) updateData.carbs = input.carbs;
    if (input.fiber !== undefined) updateData.fiber = input.fiber;
    if (input.sugar !== undefined) updateData.sugar = input.sugar;
    if (input.servingSize !== undefined)
      updateData.servingSize = input.servingSize;
    if (input.barcode !== undefined) updateData.barcode = input.barcode;
    if (input.brand !== undefined) updateData.brand = input.brand;

    await updateEntity(id, updateData);

    revalidatePath("/nutrition");

    const updatedEntity = (await getEntityById(id)) as FoodEntity;

    const food: FoodItem = {
      id,
      name: updatedEntity.name,
      servingSize: updatedEntity.data.servingSize as number,
      macros: {
        calories: updatedEntity.data.calories as number,
        protein: updatedEntity.data.protein as number,
        fat: updatedEntity.data.fat as number,
        carbs: updatedEntity.data.carbs as number,
        fiber: updatedEntity.data.fiber as number | undefined,
        sugar: updatedEntity.data.sugar as number | undefined,
      },
      barcode: updatedEntity.data.barcode as string | undefined,
      brand: updatedEntity.data.brand as string | undefined,
      updatedAt: now,
    };

    return { success: true, data: food };
  } catch (error) {
    console.error("Failed to update food:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a food item (soft delete)
 */
export async function deleteFood(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/nutrition");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete food:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all food items
 */
export async function getFoods(): Promise<FoodItem[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType("food", false)) as FoodEntity[];
    return entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      servingSize: entity.data.servingSize as number,
      macros: {
        calories: entity.data.calories as number,
        protein: entity.data.protein as number,
        fat: entity.data.fat as number,
        carbs: entity.data.carbs as number,
        fiber: entity.data.fiber as number | undefined,
        sugar: entity.data.sugar as number | undefined,
      },
      barcode: entity.data.barcode as string | undefined,
      brand: entity.data.brand as string | undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to get foods:", error);
    return [];
  }
}

/**
 * Get food by ID
 */
export async function getFoodById(id: string): Promise<FoodItem | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "food") {
      return null;
    }

    const foodEntity = entity as FoodEntity;
    return {
      id: foodEntity.id,
      name: foodEntity.name,
      servingSize: foodEntity.data.servingSize as number,
      macros: {
        calories: foodEntity.data.calories as number,
        protein: foodEntity.data.protein as number,
        fat: foodEntity.data.fat as number,
        carbs: foodEntity.data.carbs as number,
        fiber: foodEntity.data.fiber as number | undefined,
        sugar: foodEntity.data.sugar as number | undefined,
      },
      barcode: foodEntity.data.barcode as string | undefined,
      brand: foodEntity.data.brand as string | undefined,
      createdAt: foodEntity.createdAt,
      updatedAt: foodEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get food by ID:", error);
    return null;
  }
}

/**
 * Create a new meal
 */
export async function createMeal(
  input: CreateMealInput,
): Promise<{ success: boolean; data?: Meal; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const dateTimestamp = new Date(input.date).getTime();

    // Load all foods and calculate total macros
    const allFoods = await getFoods();
    const mealFoods: MealFoodItem[] = [];
    let totalMacros: NutritionMacros = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };

    for (const foodItem of input.foods) {
      const food = allFoods.find((f) => f.id === foodItem.foodId);
      if (!food) continue;

      const macros = calculatePortionMacros(food, foodItem.servings);
      const totalGrams = foodItem.servings * food.servingSize;

      mealFoods.push({
        foodId: food.id,
        servings: foodItem.servings,
        totalGrams,
        macros,
      });

      totalMacros.calories += macros.calories;
      totalMacros.protein += macros.protein;
      totalMacros.fat += macros.fat;
      totalMacros.carbs += macros.carbs;
      if (macros.fiber !== undefined)
        totalMacros.fiber = (totalMacros.fiber || 0) + macros.fiber;
      if (macros.sugar !== undefined)
        totalMacros.sugar = (totalMacros.sugar || 0) + macros.sugar;
    }

    const id = await createEntity<MealEntity>({
      type: "meal",
      name: input.name,
      data: {
        date: dateTimestamp,
        mealType: input.mealType,
        foods: mealFoods,
        totalMacros,
        note: input.note,
      },
    });

    revalidatePath("/nutrition");

    const meal: Meal = {
      id,
      name: input.name,
      date: dateTimestamp,
      mealType: input.mealType,
      foods: mealFoods,
      totalMacros,
      note: input.note,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: meal };
  } catch (error) {
    console.error("Failed to create meal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing meal
 */
export async function updateMeal(
  input: UpdateMealInput,
): Promise<{ success: boolean; data?: Meal; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "meal") {
      return { success: false, error: "Meal not found" };
    }

    const mealEntity = entity as MealEntity;
    const now = Date.now();

    // Load all foods
    const allFoods = await getFoods();
    let mealFoods = mealEntity.data.foods as MealFoodItem[] | undefined;
    let totalMacros = mealEntity.data.totalMacros as
      | NutritionMacros
      | undefined;

    // If foods are being updated, recalculate
    if (input.foods) {
      mealFoods = [];
      totalMacros = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      };

      for (const foodItem of input.foods) {
        const food = allFoods.find((f) => f.id === foodItem.foodId);
        if (!food) continue;

        const macros = calculatePortionMacros(food, foodItem.servings);
        const totalGrams = foodItem.servings * food.servingSize;

        mealFoods.push({
          foodId: food.id,
          servings: foodItem.servings,
          totalGrams,
          macros,
        });

        totalMacros.calories += macros.calories;
        totalMacros.protein += macros.protein;
        totalMacros.fat += macros.fat;
        totalMacros.carbs += macros.carbs;
        if (macros.fiber !== undefined)
          totalMacros.fiber = (totalMacros.fiber || 0) + macros.fiber;
        if (macros.sugar !== undefined)
          totalMacros.sugar = (totalMacros.sugar || 0) + macros.sugar;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.mealType !== undefined) updateData.mealType = input.mealType;
    if (mealFoods !== undefined) updateData.foods = mealFoods;
    if (totalMacros !== undefined) updateData.totalMacros = totalMacros;
    if (input.note !== undefined) updateData.note = input.note;

    await updateEntity(input.id, updateData);

    revalidatePath("/nutrition");

    const updatedEntity = (await getEntityById(input.id)) as MealEntity;

    const meal: Meal = {
      id: updatedEntity.id,
      name: updatedEntity.name,
      date: updatedEntity.data.date as number,
      mealType: updatedEntity.data.mealType as
        | "breakfast"
        | "lunch"
        | "dinner"
        | "snack",
      foods: (updatedEntity.data.foods as MealFoodItem[]) || [],
      totalMacros: (updatedEntity.data.totalMacros as NutritionMacros) || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      note: updatedEntity.data.note as string | undefined,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: meal };
  } catch (error) {
    console.error("Failed to update meal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a meal (soft delete)
 */
export async function deleteMeal(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/nutrition");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete meal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get meals by date
 */
export async function getMealsByDate(date: string): Promise<Meal[]> {
  "use server";
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = startOfDay.getTime();
    const endTimestamp = endOfDay.getTime();

    const entities = (await getEntitiesByType("meal", false)) as MealEntity[];

    const meals = entities
      .filter((entity) => {
        const mealDate = entity.data.date as number;
        return mealDate >= startTimestamp && mealDate <= endTimestamp;
      })
      .map((entity) => ({
        id: entity.id,
        name: entity.name,
        date: entity.data.date as number,
        mealType: entity.data.mealType as
          | "breakfast"
          | "lunch"
          | "dinner"
          | "snack",
        foods: (entity.data.foods as MealFoodItem[]) || [],
        totalMacros: (entity.data.totalMacros as NutritionMacros) || {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
        },
        note: entity.data.note as string | undefined,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
      }));

    // Sort by meal type order
    const mealTypeOrder: Record<
      "breakfast" | "lunch" | "dinner" | "snack",
      number
    > = {
      breakfast: 0,
      lunch: 1,
      dinner: 2,
      snack: 3,
    };

    return meals.sort(
      (a, b) => mealTypeOrder[a.mealType] - mealTypeOrder[b.mealType],
    );
  } catch (error) {
    console.error("Failed to get meals by date:", error);
    return [];
  }
}

/**
 * Get daily nutrition log
 */
export async function getDailyLog(date: string): Promise<DailyNutritionLog> {
  "use server";
  const meals = await getMealsByDate(date);
  const waterIntake = await getWaterIntake(date);

  const totalMacros: NutritionMacros = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };

  meals.forEach((meal) => {
    totalMacros.calories += meal.totalMacros.calories;
    totalMacros.protein += meal.totalMacros.protein;
    totalMacros.fat += meal.totalMacros.fat;
    totalMacros.carbs += meal.totalMacros.carbs;
    if (meal.totalMacros.fiber)
      totalMacros.fiber = (totalMacros.fiber || 0) + meal.totalMacros.fiber;
    if (meal.totalMacros.sugar)
      totalMacros.sugar = (totalMacros.sugar || 0) + meal.totalMacros.sugar;
  });

  return {
    date,
    meals,
    totalMacros,
    waterIntake,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Update water intake for a date
 */
export async function updateWaterIntake(
  date: string,
  waterIntake: number,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    const id = `water_intake_${date}`;

    // Store water intake as a generic entity
    await createEntity({
      type: "waterIntake",
      name: `Water Intake ${date}`,
      data: {
        date,
        amount: waterIntake,
      },
    });

    revalidatePath("/nutrition");
    return { success: true };
  } catch (error) {
    console.error("Failed to update water intake:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get water intake for a date
 */
export async function getWaterIntake(date: string): Promise<number> {
  "use server";
  try {
    const id = `water_intake_${date}`;
    const entity = await getEntityById(id);

    if (!entity) {
      return 0;
    }

    return (entity.data.amount as number) || 0;
  } catch (error) {
    console.error("Failed to get water intake:", error);
    return 0;
  }
}

/**
 * Create or update nutrition goal
 */
export async function setNutritionGoal(
  input: CreateNutritionGoalInput,
): Promise<{ success: boolean; data?: NutritionGoal; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const id = `nutrition_goal_${input.date}`;

    // Check if goal already exists for this date
    const existingGoal = await getNutritionGoal(input.date);

    if (existingGoal) {
      return await updateNutritionGoal(input.date, {
        calories: input.calories,
        protein: input.protein,
        fat: input.fat,
        carbs: input.carbs,
        water: input.water,
      });
    }

    // Create new goal using generic entity
    await createEntity({
      type: "nutritionGoal",
      name: `Nutrition Goal ${input.date}`,
      data: {
        date: input.date,
        calories: input.calories,
        protein: input.protein,
        fat: input.fat,
        carbs: input.carbs,
        water: input.water,
      },
    });

    revalidatePath("/nutrition");

    const goal: NutritionGoal = {
      id,
      date: input.date,
      calories: input.calories,
      protein: input.protein,
      fat: input.fat,
      carbs: input.carbs,
      water: input.water,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: goal };
  } catch (error) {
    console.error("Failed to set nutrition goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update nutrition goal
 */
export async function updateNutritionGoal(
  date: string,
  input: UpdateNutritionGoalInput,
): Promise<{ success: boolean; data?: NutritionGoal; error?: string }> {
  "use server";
  try {
    const id = `nutrition_goal_${date}`;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.calories !== undefined) updateData.calories = input.calories;
    if (input.protein !== undefined) updateData.protein = input.protein;
    if (input.fat !== undefined) updateData.fat = input.fat;
    if (input.carbs !== undefined) updateData.carbs = input.carbs;
    if (input.water !== undefined) updateData.water = input.water;

    await updateEntity(id, updateData);

    revalidatePath("/nutrition");

    const goal: NutritionGoal = {
      id,
      date,
      calories: (input.calories as number) || 0,
      protein: (input.protein as number) || 0,
      fat: (input.fat as number) || 0,
      carbs: (input.carbs as number) || 0,
      water: (input.water as number) || 0,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: goal };
  } catch (error) {
    console.error("Failed to update nutrition goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get nutrition goal for a date
 */
export async function getNutritionGoal(
  date: string,
): Promise<NutritionGoal | null> {
  "use server";
  try {
    const id = `nutrition_goal_${date}`;
    const entity = await getEntityById(id);

    if (!entity) {
      // Return default goals
      return {
        id: "",
        date,
        calories: 2000,
        protein: 150,
        fat: 67,
        carbs: 250,
        water: 2000,
        createdAt: 0,
        updatedAt: 0,
      };
    }

    return {
      id: entity.id,
      date: entity.data.date as string,
      calories: entity.data.calories as number,
      protein: entity.data.protein as number,
      fat: entity.data.fat as number,
      carbs: entity.data.carbs as number,
      water: entity.data.water as number,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get nutrition goal:", error);
    return null;
  }
}

/**
 * Get nutrition summary for a date
 */
export async function getNutritionSummary(
  date: string,
): Promise<NutritionSummary> {
  "use server";
  const dailyLog = await getDailyLog(date);
  const goal = await getNutritionGoal(date);

  // Default goals if goal is null
  const safeGoal = goal || {
    calories: 2000,
    protein: 150,
    fat: 67,
    carbs: 250,
    water: 2000,
  };

  const progress = {
    calories: Math.round(
      (dailyLog.totalMacros.calories / safeGoal.calories) * 100,
    ),
    protein: Math.round(
      (dailyLog.totalMacros.protein / safeGoal.protein) * 100,
    ),
    fat: Math.round((dailyLog.totalMacros.fat / safeGoal.fat) * 100),
    carbs: Math.round((dailyLog.totalMacros.carbs / safeGoal.carbs) * 100),
    water: Math.round((dailyLog.waterIntake / safeGoal.water) * 100),
  };

  return {
    date,
    totalCalories: dailyLog.totalMacros.calories,
    totalProtein: dailyLog.totalMacros.protein,
    totalFat: dailyLog.totalMacros.fat,
    totalCarbs: dailyLog.totalMacros.carbs,
    totalWater: dailyLog.waterIntake,
    calorieGoal: safeGoal.calories,
    proteinGoal: safeGoal.protein,
    fatGoal: safeGoal.fat,
    carbsGoal: safeGoal.carbs,
    waterGoal: safeGoal.water,
    caloriesRemaining: safeGoal.calories - dailyLog.totalMacros.calories,
    progress,
  };
}

/**
 * Get weekly nutrition summary
 */
export async function getWeeklyNutritionSummary(
  startDate: string,
): Promise<NutritionSummary[]> {
  "use server";
  const summaries: NutritionSummary[] = [];
  const start = new Date(startDate);

  for (let i = 0; i < 7; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    summaries.push(await getNutritionSummary(dateStr));
  }

  return summaries;
}
