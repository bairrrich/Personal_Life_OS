// Meal Plan Actions for Nutrition Module

"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
} from "@/entity-engine/engine";
import type { MealPlanEntity } from "@/entity-engine/types";
import type {
  MealPlan,
  DayPlan,
  CreateMealPlanInput,
  UpdateMealPlanInput,
} from "./types";
import {
  getWeekStart,
  getWeekEnd,
  createDefaultDayPlans,
} from "./meal-plan-utils";

// Re-export utilities for client use
export { getWeekStart, getWeekEnd, createDefaultDayPlans };

/**
 * Create a new meal plan
 */
export async function createMealPlan(
  input: CreateMealPlanInput,
): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const weekStart = new Date(input.weekStart);
    const weekEnd = getWeekEnd(weekStart);

    const id = await createEntity<MealPlanEntity>({
      type: "mealPlan",
      name: input.name,
      data: {
        name: input.name,
        weekStart: input.weekStart,
        weekEnd: weekEnd.toISOString().split("T")[0],
        days: input.days,
      },
    });

    revalidatePath("/nutrition");

    const mealPlan: MealPlan = {
      id,
      name: input.name,
      weekStart: input.weekStart,
      weekEnd: weekEnd.toISOString().split("T")[0],
      days: input.days,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: mealPlan };
  } catch (error) {
    console.error("Failed to create meal plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing meal plan
 */
export async function updateMealPlan(
  input: UpdateMealPlanInput,
): Promise<{ success: boolean; data?: MealPlan; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "mealPlan") {
      return { success: false, error: "Meal plan not found" };
    }

    const mealPlanEntity = entity as MealPlanEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.days !== undefined) updateData.days = input.days;

    await updateEntity(input.id, updateData);

    revalidatePath("/nutrition");

    const updatedEntity = (await getEntityById(input.id)) as MealPlanEntity;

    const mealPlan: MealPlan = {
      id: updatedEntity.id,
      name: updatedEntity.data.name as string,
      weekStart: updatedEntity.data.weekStart as string,
      weekEnd: updatedEntity.data.weekEnd as string,
      days: updatedEntity.data.days as DayPlan[],
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: mealPlan };
  } catch (error) {
    console.error("Failed to update meal plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a meal plan (soft delete)
 */
export async function deleteMealPlan(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/nutrition");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete meal plan:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all meal plans
 */
export async function getMealPlans(): Promise<MealPlan[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "mealPlan",
      false,
    )) as MealPlanEntity[];
    return entities.map((entity) => ({
      id: entity.id,
      name: entity.data.name as string,
      weekStart: entity.data.weekStart as string,
      weekEnd: entity.data.weekEnd as string,
      days: entity.data.days as DayPlan[],
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }));
  } catch (error) {
    console.error("Failed to get meal plans:", error);
    return [];
  }
}

/**
 * Get meal plan by ID
 */
export async function getMealPlanById(id: string): Promise<MealPlan | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "mealPlan") {
      return null;
    }

    const mealPlanEntity = entity as MealPlanEntity;
    return {
      id: mealPlanEntity.id,
      name: mealPlanEntity.data.name as string,
      weekStart: mealPlanEntity.data.weekStart as string,
      weekEnd: mealPlanEntity.data.weekEnd as string,
      days: mealPlanEntity.data.days as DayPlan[],
      createdAt: mealPlanEntity.createdAt,
      updatedAt: mealPlanEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get meal plan by ID:", error);
    return null;
  }
}

/**
 * Get meal plan for current week
 */
export async function getCurrentWeekMealPlan(): Promise<MealPlan | null> {
  "use server";
  try {
    const now = new Date();
    const weekStart = getWeekStart(now);
    const weekEnd = getWeekEnd(now);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const entities = (await getEntitiesByType(
      "mealPlan",
      false,
    )) as MealPlanEntity[];

    const mealPlan = entities.find((entity) => {
      const entityWeekStart = entity.data.weekStart as string;
      const entityWeekEnd = entity.data.weekEnd as string;
      return entityWeekStart === weekStartStr && entityWeekEnd === weekEndStr;
    });

    if (!mealPlan) {
      return null;
    }

    return {
      id: mealPlan.id,
      name: mealPlan.data.name as string,
      weekStart: mealPlan.data.weekStart as string,
      weekEnd: mealPlan.data.weekEnd as string,
      days: mealPlan.data.days as DayPlan[],
      createdAt: mealPlan.createdAt,
      updatedAt: mealPlan.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get current week meal plan:", error);
    return null;
  }
}
