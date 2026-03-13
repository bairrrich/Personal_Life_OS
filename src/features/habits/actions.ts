"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
} from "@/entity-engine/engine";
import type { HabitEntity } from "@/entity-engine/types";
import type {
  Habit,
  HabitCompletion,
  CreateHabitInput,
  UpdateHabitInput,
  HabitFilters,
  CompleteHabitInput,
} from "./types";
import { calculateStreak, getTodayString } from "./utils";

/**
 * =====================
 * HABIT ACTIONS
 * =====================
 */

export async function createHabit(
  input: CreateHabitInput,
): Promise<{ success: boolean; data?: Habit; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const startDate = input.startDate || now;

    const id = await createEntity<HabitEntity>({
      type: "habit",
      name: input.title,
      data: {
        description: input.description,
        category: input.category,
        status: "active",
        frequency: input.frequency,
        specificDays: input.specificDays,
        targetValue: input.targetValue,
        currentValue: 0,
        unit: input.unit,
        streak: {
          current: 0,
          longest: 0,
        },
        completions: [],
        startDate,
        endDate: input.endDate,
        reminder: input.reminder,
        notes: input.notes,
        tags: input.tags,
        isFavorite: input.isFavorite || false,
        isCustom: true,
      },
    });

    revalidatePath("/habits");

    const habit: Habit = {
      id,
      title: input.title,
      description: input.description,
      category: input.category,
      status: "active",
      frequency: input.frequency,
      specificDays: input.specificDays,
      targetValue: input.targetValue,
      currentValue: 0,
      unit: input.unit,
      streak: {
        current: 0,
        longest: 0,
      },
      completions: [],
      startDate,
      endDate: input.endDate,
      reminder: input.reminder,
      notes: input.notes,
      tags: input.tags,
      isFavorite: input.isFavorite || false,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: habit };
  } catch (error) {
    console.error("Failed to create habit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateHabit(
  input: UpdateHabitInput,
): Promise<{ success: boolean; data?: Habit; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "habit") {
      return { success: false, error: "Habit not found" };
    }

    const habitEntity = entity as HabitEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.frequency !== undefined) updateData.frequency = input.frequency;
    if (input.specificDays !== undefined)
      updateData.specificDays = input.specificDays;
    if (input.targetValue !== undefined)
      updateData.targetValue = input.targetValue;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.reminder !== undefined) updateData.reminder = input.reminder;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.isFavorite !== undefined)
      updateData.isFavorite = input.isFavorite;

    await updateEntity(input.id, updateData);

    revalidatePath("/habits");

    const updatedEntity = (await getEntityById(input.id)) as HabitEntity;

    const habit: Habit = {
      id: updatedEntity.id,
      title: updatedEntity.name,
      description: updatedEntity.data.description as string | undefined,
      category: updatedEntity.data.category as any,
      status: updatedEntity.data.status as any,
      frequency: updatedEntity.data.frequency as any,
      specificDays: updatedEntity.data.specificDays as any,
      targetValue: updatedEntity.data.targetValue as number,
      currentValue: updatedEntity.data.currentValue as number,
      unit: updatedEntity.data.unit as string,
      streak: updatedEntity.data.streak as any,
      completions: (updatedEntity.data.completions as HabitCompletion[]) || [],
      startDate: updatedEntity.data.startDate as number,
      endDate: updatedEntity.data.endDate as number | undefined,
      reminder: updatedEntity.data.reminder as any,
      notes: updatedEntity.data.notes as string | undefined,
      tags: updatedEntity.data.tags as string[] | undefined,
      isFavorite: updatedEntity.data.isFavorite as boolean,
      isCustom: updatedEntity.data.isCustom as boolean,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: habit };
  } catch (error) {
    console.error("Failed to update habit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteHabit(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/habits");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete habit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getHabits(filters?: HabitFilters): Promise<Habit[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType("habit", false)) as HabitEntity[];

    let habits = entities.map((entity) => ({
      id: entity.id,
      title: entity.name,
      description: entity.data.description as string | undefined,
      category: entity.data.category as any,
      status: entity.data.status as any,
      frequency: entity.data.frequency as any,
      specificDays: entity.data.specificDays as any,
      targetValue: entity.data.targetValue as number,
      currentValue: entity.data.currentValue as number,
      unit: entity.data.unit as string,
      streak: entity.data.streak as any,
      completions: (entity.data.completions as HabitCompletion[]) || [],
      startDate: entity.data.startDate as number,
      endDate: entity.data.endDate as number | undefined,
      reminder: entity.data.reminder as any,
      notes: entity.data.notes as string | undefined,
      tags: entity.data.tags as string[] | undefined,
      isFavorite: entity.data.isFavorite as boolean,
      isCustom: entity.data.isCustom as boolean,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })) as Habit[];

    // Apply filters
    if (filters) {
      if (filters.category) {
        habits = habits.filter((h) => h.category === filters.category);
      }
      if (filters.status) {
        habits = habits.filter((h) => h.status === filters.status);
      }
      if (filters.frequency) {
        habits = habits.filter((h) => h.frequency === filters.frequency);
      }
      if (filters.isFavorite !== undefined) {
        habits = habits.filter((h) => h.isFavorite === filters.isFavorite);
      }
      if (filters.hasActiveStreak) {
        habits = habits.filter((h) => h.streak.current > 0);
      }
      if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        habits = habits.filter(
          (h) =>
            h.title.toLowerCase().includes(searchQuery) ||
            h.description?.toLowerCase().includes(searchQuery) ||
            h.notes?.toLowerCase().includes(searchQuery) ||
            h.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        habits = habits.filter((h) =>
          h.tags?.some((tag) => filters.tags!.includes(tag)),
        );
      }
    }

    return habits;
  } catch (error) {
    console.error("Failed to get habits:", error);
    return [];
  }
}

export async function getHabitById(id: string): Promise<Habit | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "habit") {
      return null;
    }

    const habitEntity = entity as HabitEntity;
    return {
      id: habitEntity.id,
      title: habitEntity.name,
      description: habitEntity.data.description as string | undefined,
      category: habitEntity.data.category as any,
      status: habitEntity.data.status as any,
      frequency: habitEntity.data.frequency as any,
      specificDays: habitEntity.data.specificDays as any,
      targetValue: habitEntity.data.targetValue as number,
      currentValue: habitEntity.data.currentValue as number,
      unit: habitEntity.data.unit as string,
      streak: habitEntity.data.streak as any,
      completions: (habitEntity.data.completions as HabitCompletion[]) || [],
      startDate: habitEntity.data.startDate as number,
      endDate: habitEntity.data.endDate as number | undefined,
      reminder: habitEntity.data.reminder as any,
      notes: habitEntity.data.notes as string | undefined,
      tags: habitEntity.data.tags as string[] | undefined,
      isFavorite: habitEntity.data.isFavorite as boolean,
      isCustom: habitEntity.data.isCustom as boolean,
      createdAt: habitEntity.createdAt,
      updatedAt: habitEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get habit by ID:", error);
    return null;
  }
}

/**
 * =====================
 * COMPLETION ACTIONS
 * =====================
 */

export async function completeHabit(
  input: CompleteHabitInput,
): Promise<{ success: boolean; data?: Habit; error?: string }> {
  "use server";
  try {
    const habit = await getHabitById(input.id);
    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    const entity = await getEntityById(input.id);
    if (!entity) {
      return { success: false, error: "Habit not found" };
    }

    const completions = (entity.data.completions as HabitCompletion[]) || [];

    // Check if already completed on this date
    const existingIndex = completions.findIndex((c) => c.date === input.date);

    const completion: HabitCompletion = {
      date: input.date,
      completed: true,
      completedAt: Date.now(),
      note: input.note,
      value: input.value,
    };

    if (existingIndex >= 0) {
      completions[existingIndex] = completion;
    } else {
      completions.push(completion);
    }

    // Recalculate streak
    const streak = calculateStreak(completions);

    await updateEntity(input.id, {
      completions,
      streak,
      currentValue: input.value ?? habit.currentValue,
    });

    revalidatePath("/habits");

    return { success: true, data: (await getHabitById(input.id)) || undefined };
  } catch (error) {
    console.error("Failed to complete habit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function uncompleteHabit(
  id: string,
  date: string,
): Promise<{ success: boolean; data?: Habit; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity) {
      return { success: false, error: "Habit not found" };
    }

    const completions = (entity.data.completions as HabitCompletion[]) || [];
    const updatedCompletions = completions.filter((c) => c.date !== date);

    // Recalculate streak
    const streak = calculateStreak(updatedCompletions);

    await updateEntity(id, {
      completions: updatedCompletions,
      streak,
    });

    revalidatePath("/habits");

    return { success: true, data: (await getHabitById(id)) || undefined };
  } catch (error) {
    console.error("Failed to uncomplete habit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function toggleHabitFavorite(
  id: string,
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  "use server";
  try {
    const habit = await getHabitById(id);
    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    await updateEntity(id, { isFavorite: !habit.isFavorite });
    revalidatePath("/habits");

    return { success: true, isFavorite: !habit.isFavorite };
  } catch (error) {
    console.error("Failed to toggle habit favorite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function pauseHabit(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    const habit = await getHabitById(id);
    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    await updateEntity(id, { status: "paused" });
    revalidatePath("/habits");

    return { success: true };
  } catch (error) {
    console.error("Failed to pause habit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function resumeHabit(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    const habit = await getHabitById(id);
    if (!habit) {
      return { success: false, error: "Habit not found" };
    }

    await updateEntity(id, { status: "active" });
    revalidatePath("/habits");

    return { success: true };
  } catch (error) {
    console.error("Failed to resume habit:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
