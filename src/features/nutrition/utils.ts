// Nutrition utilities

import type { FoodItem, NutritionMacros } from "./types";

/**
 * Calculate macros for a portion of food
 */
export function calculatePortionMacros(
  food: FoodItem,
  servings: number,
): NutritionMacros {
  const multiplier = (servings * food.servingSize) / food.servingSize;
  return {
    calories: Math.round(food.macros.calories * multiplier),
    protein: Math.round(food.macros.protein * multiplier * 10) / 10,
    fat: Math.round(food.macros.fat * multiplier * 10) / 10,
    carbs: Math.round(food.macros.carbs * multiplier * 10) / 10,
    fiber: food.macros.fiber
      ? Math.round(food.macros.fiber * multiplier * 10) / 10
      : undefined,
    sugar: food.macros.sugar
      ? Math.round(food.macros.sugar * multiplier * 10) / 10
      : undefined,
  };
}
