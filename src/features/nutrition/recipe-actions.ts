// Recipe Actions for Nutrition Module

"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
} from "@/entity-engine/engine";
import type { RecipeEntity } from "@/entity-engine/types";
import type {
  Recipe,
  RecipeIngredient,
  CreateRecipeInput,
  UpdateRecipeInput,
  NutritionMacros,
} from "./types";
import { getFoods } from "./actions";
import { calculatePortionMacros } from "./utils";

/**
 * Create a new recipe
 */
export async function createRecipe(
  input: CreateRecipeInput,
): Promise<{ success: boolean; data?: Recipe; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const allFoods = await getFoods();

    // Calculate ingredients and total macros
    const ingredients: RecipeIngredient[] = [];
    let totalMacros: NutritionMacros = {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
    };

    for (const item of input.ingredients) {
      const food = allFoods.find((f) => f.id === item.foodId);
      if (!food) continue;

      const macros = calculatePortionMacros(food, item.servings);
      const totalGrams = item.servings * food.servingSize;

      ingredients.push({
        foodId: food.id,
        servings: item.servings,
        totalGrams,
        macros,
      });

      totalMacros.calories += macros.calories;
      totalMacros.protein += macros.protein;
      totalMacros.fat += macros.fat;
      totalMacros.carbs += macros.carbs;
      if (macros.fiber)
        totalMacros.fiber = (totalMacros.fiber || 0) + macros.fiber;
      if (macros.sugar)
        totalMacros.sugar = (totalMacros.sugar || 0) + macros.sugar;
    }

    const id = await createEntity<RecipeEntity>({
      type: "recipe",
      name: input.name,
      data: {
        description: input.description,
        ingredients,
        totalMacros,
        servings: input.servings,
        prepTime: input.prepTime,
        cookTime: input.cookTime,
        instructions: input.instructions,
        tags: input.tags,
      },
    });

    revalidatePath("/nutrition");

    const recipe: Recipe = {
      id,
      name: input.name,
      description: input.description,
      ingredients,
      totalMacros,
      servings: input.servings,
      prepTime: input.prepTime,
      cookTime: input.cookTime,
      instructions: input.instructions,
      tags: input.tags,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: recipe };
  } catch (error) {
    console.error("Failed to create recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing recipe
 */
export async function updateRecipe(
  input: UpdateRecipeInput,
): Promise<{ success: boolean; data?: Recipe; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "recipe") {
      return { success: false, error: "Recipe not found" };
    }

    const recipeEntity = entity as RecipeEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.servings !== undefined) updateData.servings = input.servings;
    if (input.prepTime !== undefined) updateData.prepTime = input.prepTime;
    if (input.cookTime !== undefined) updateData.cookTime = input.cookTime;
    if (input.instructions !== undefined)
      updateData.instructions = input.instructions;
    if (input.tags !== undefined) updateData.tags = input.tags;

    // Recalculate ingredients if provided
    if (input.ingredients) {
      const allFoods = await getFoods();
      const ingredients: RecipeIngredient[] = [];
      let totalMacros: NutritionMacros = {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      };

      for (const item of input.ingredients) {
        const food = allFoods.find((f) => f.id === item.foodId);
        if (!food) continue;

        const macros = calculatePortionMacros(food, item.servings);
        const totalGrams = item.servings * food.servingSize;

        ingredients.push({
          foodId: food.id,
          servings: item.servings,
          totalGrams,
          macros,
        });

        totalMacros.calories += macros.calories;
        totalMacros.protein += macros.protein;
        totalMacros.fat += macros.fat;
        totalMacros.carbs += macros.carbs;
        if (macros.fiber)
          totalMacros.fiber = (totalMacros.fiber || 0) + macros.fiber;
        if (macros.sugar)
          totalMacros.sugar = (totalMacros.sugar || 0) + macros.sugar;
      }

      updateData.ingredients = ingredients;
      updateData.totalMacros = totalMacros;
    }

    await updateEntity(input.id, updateData);

    revalidatePath("/nutrition");

    const updatedEntity = (await getEntityById(input.id)) as RecipeEntity;

    const recipe: Recipe = {
      id: updatedEntity.id,
      name: updatedEntity.name,
      description: updatedEntity.data.description as string | undefined,
      ingredients: (updatedEntity.data.ingredients as RecipeIngredient[]) || [],
      totalMacros: (updatedEntity.data.totalMacros as NutritionMacros) || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      servings: updatedEntity.data.servings as number,
      prepTime: updatedEntity.data.prepTime as number | undefined,
      cookTime: updatedEntity.data.cookTime as number | undefined,
      instructions: updatedEntity.data.instructions as string[] | undefined,
      tags: updatedEntity.data.tags as string[] | undefined,
      isCustom: true,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: recipe };
  } catch (error) {
    console.error("Failed to update recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a recipe (soft delete)
 */
export async function deleteRecipe(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/nutrition");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete recipe:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all recipes
 */
export async function getRecipes(): Promise<Recipe[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "recipe",
      false,
    )) as RecipeEntity[];
    return entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      description: entity.data.description as string | undefined,
      ingredients: (entity.data.ingredients as RecipeIngredient[]) || [],
      totalMacros: (entity.data.totalMacros as NutritionMacros) || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      servings: entity.data.servings as number,
      prepTime: entity.data.prepTime as number | undefined,
      cookTime: entity.data.cookTime as number | undefined,
      instructions: entity.data.instructions as string[] | undefined,
      tags: entity.data.tags as string[] | undefined,
      isCustom: true,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to get recipes:", error);
    return [];
  }
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(id: string): Promise<Recipe | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "recipe") {
      return null;
    }

    const recipeEntity = entity as RecipeEntity;
    return {
      id: recipeEntity.id,
      name: recipeEntity.name,
      description: recipeEntity.data.description as string | undefined,
      ingredients: (recipeEntity.data.ingredients as RecipeIngredient[]) || [],
      totalMacros: (recipeEntity.data.totalMacros as NutritionMacros) || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      },
      servings: recipeEntity.data.servings as number,
      prepTime: recipeEntity.data.prepTime as number | undefined,
      cookTime: recipeEntity.data.cookTime as number | undefined,
      instructions: recipeEntity.data.instructions as string[] | undefined,
      tags: recipeEntity.data.tags as string[] | undefined,
      isCustom: true,
      createdAt: recipeEntity.createdAt,
      updatedAt: recipeEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get recipe by ID:", error);
    return null;
  }
}
