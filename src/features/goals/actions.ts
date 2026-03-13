"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
} from "@/entity-engine/engine";
import type { GoalEntity } from "@/entity-engine/types";
import type {
  Goal,
  Milestone,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  GoalFilters,
  UpdateGoalProgressInput,
} from "./types";
import { calculateProgress } from "./utils";

/**
 * =====================
 * GOAL ACTIONS
 * =====================
 */

export async function createGoal(
  input: CreateGoalInput,
): Promise<{ success: boolean; data?: Goal; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const startDate = input.startDate || now;

    // Calculate initial progress
    const progress = calculateProgress(
      input.currentValue || 0,
      input.targetValue,
    );

    // Create milestones if provided
    const milestones: Milestone[] = (input.milestones || []).map((m) => ({
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: m.title,
      description: m.description,
      targetValue: m.targetValue,
      currentValue: 0,
      unit: m.unit,
      deadline: m.deadline,
      status: "pending",
      order: m.order,
      createdAt: now,
      updatedAt: now,
    }));

    const id = await createEntity<GoalEntity>({
      type: "goal",
      name: input.title,
      data: {
        category: input.category,
        status: "active",
        priority: input.priority,
        timeframe: input.timeframe,
        targetType: input.targetType,
        targetValue: input.targetValue,
        currentValue: input.currentValue || 0,
        unit: input.unit,
        startDate,
        deadline: input.deadline,
        completedAt: undefined,
        progress,
        milestones,
        linkedEntityId: input.linkedEntityId,
        linkedModule: input.linkedModule,
        notes: input.notes,
        tags: input.tags,
        isFavorite: input.isFavorite || false,
        isCustom: true,
      },
    });

    revalidatePath("/goals");

    const goal: Goal = {
      id,
      title: input.title,
      description: input.description,
      category: input.category,
      status: "active",
      priority: input.priority,
      timeframe: input.timeframe,
      targetType: input.targetType,
      targetValue: input.targetValue,
      currentValue: input.currentValue || 0,
      unit: input.unit,
      startDate,
      deadline: input.deadline,
      completedAt: undefined,
      progress,
      milestones,
      linkedEntityId: input.linkedEntityId,
      linkedModule: input.linkedModule,
      notes: input.notes,
      tags: input.tags,
      isFavorite: input.isFavorite || false,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: goal };
  } catch (error) {
    console.error("Failed to create goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateGoal(
  input: UpdateGoalInput,
): Promise<{ success: boolean; data?: Goal; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "goal") {
      return { success: false, error: "Goal not found" };
    }

    const goalEntity = entity as GoalEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.status !== undefined) {
      updateData.status = input.status;
      if (input.status === "completed") {
        updateData.completedAt = now;
        updateData.progress = 100;
      }
    }
    if (input.priority !== undefined) updateData.priority = input.priority;
    if (input.timeframe !== undefined) updateData.timeframe = input.timeframe;
    if (input.targetValue !== undefined)
      updateData.targetValue = input.targetValue;
    if (input.currentValue !== undefined)
      updateData.currentValue = input.currentValue;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.deadline !== undefined) updateData.deadline = input.deadline;
    if (input.completedAt !== undefined)
      updateData.completedAt = input.completedAt;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.isFavorite !== undefined)
      updateData.isFavorite = input.isFavorite;

    // Recalculate progress if currentValue or targetValue changed
    const currentValue =
      input.currentValue ?? (goalEntity.data.currentValue as number);
    const targetValue =
      input.targetValue ?? (goalEntity.data.targetValue as number);
    updateData.progress = calculateProgress(currentValue, targetValue);

    await updateEntity(input.id, updateData);

    revalidatePath("/goals");

    const updatedEntity = (await getEntityById(input.id)) as GoalEntity;

    const goal: Goal = {
      id: updatedEntity.id,
      title: updatedEntity.name,
      description: updatedEntity.data.description as string | undefined,
      category: updatedEntity.data.category as any,
      status: updatedEntity.data.status as any,
      priority: updatedEntity.data.priority as any,
      timeframe: updatedEntity.data.timeframe as any,
      targetType: updatedEntity.data.targetType as any,
      targetValue: updatedEntity.data.targetValue as number,
      currentValue: updatedEntity.data.currentValue as number,
      unit: updatedEntity.data.unit as string,
      startDate: updatedEntity.data.startDate as number,
      deadline: updatedEntity.data.deadline as number | undefined,
      completedAt: updatedEntity.data.completedAt as number | undefined,
      progress: updatedEntity.data.progress as number,
      milestones: (updatedEntity.data.milestones as Milestone[]) || [],
      linkedEntityId: updatedEntity.data.linkedEntityId as string | undefined,
      linkedModule: updatedEntity.data.linkedModule as any,
      notes: updatedEntity.data.notes as string | undefined,
      tags: updatedEntity.data.tags as string[] | undefined,
      isFavorite: updatedEntity.data.isFavorite as boolean,
      isCustom: updatedEntity.data.isCustom as boolean,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: goal };
  } catch (error) {
    console.error("Failed to update goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteGoal(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/goals");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getGoals(filters?: GoalFilters): Promise<Goal[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType("goal", false)) as GoalEntity[];

    let goals = entities.map((entity) => ({
      id: entity.id,
      title: entity.name,
      description: entity.data.description as string | undefined,
      category: entity.data.category as any,
      status: entity.data.status as any,
      priority: entity.data.priority as any,
      timeframe: entity.data.timeframe as any,
      targetType: entity.data.targetType as any,
      targetValue: entity.data.targetValue as number,
      currentValue: entity.data.currentValue as number,
      unit: entity.data.unit as string,
      startDate: entity.data.startDate as number,
      deadline: entity.data.deadline as number | undefined,
      completedAt: entity.data.completedAt as number | undefined,
      progress: entity.data.progress as number,
      milestones: (entity.data.milestones as Milestone[]) || [],
      linkedEntityId: entity.data.linkedEntityId as string | undefined,
      linkedModule: entity.data.linkedModule as any,
      notes: entity.data.notes as string | undefined,
      tags: entity.data.tags as string[] | undefined,
      isFavorite: entity.data.isFavorite as boolean,
      isCustom: entity.data.isCustom as boolean,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })) as Goal[];

    // Apply filters
    if (filters) {
      if (filters.category) {
        goals = goals.filter((g) => g.category === filters.category);
      }
      if (filters.status) {
        goals = goals.filter((g) => g.status === filters.status);
      }
      if (filters.priority) {
        goals = goals.filter((g) => g.priority === filters.priority);
      }
      if (filters.timeframe) {
        goals = goals.filter((g) => g.timeframe === filters.timeframe);
      }
      if (filters.isFavorite !== undefined) {
        goals = goals.filter((g) => g.isFavorite === filters.isFavorite);
      }
      if (filters.hasDeadline) {
        goals = goals.filter((g) => g.deadline !== undefined);
      }
      if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        goals = goals.filter(
          (g) =>
            g.title.toLowerCase().includes(searchQuery) ||
            g.description?.toLowerCase().includes(searchQuery) ||
            g.notes?.toLowerCase().includes(searchQuery) ||
            g.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        goals = goals.filter((g) =>
          g.tags?.some((tag) => filters.tags!.includes(tag)),
        );
      }
    }

    return goals;
  } catch (error) {
    console.error("Failed to get goals:", error);
    return [];
  }
}

export async function getGoalById(id: string): Promise<Goal | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "goal") {
      return null;
    }

    const goalEntity = entity as GoalEntity;
    return {
      id: goalEntity.id,
      title: goalEntity.name,
      description: goalEntity.data.description as string | undefined,
      category: goalEntity.data.category as any,
      status: goalEntity.data.status as any,
      priority: goalEntity.data.priority as any,
      timeframe: goalEntity.data.timeframe as any,
      targetType: goalEntity.data.targetType as any,
      targetValue: goalEntity.data.targetValue as number,
      currentValue: goalEntity.data.currentValue as number,
      unit: goalEntity.data.unit as string,
      startDate: goalEntity.data.startDate as number,
      deadline: goalEntity.data.deadline as number | undefined,
      completedAt: goalEntity.data.completedAt as number | undefined,
      progress: goalEntity.data.progress as number,
      milestones: (goalEntity.data.milestones as Milestone[]) || [],
      linkedEntityId: goalEntity.data.linkedEntityId as string | undefined,
      linkedModule: goalEntity.data.linkedModule as any,
      notes: goalEntity.data.notes as string | undefined,
      tags: goalEntity.data.tags as string[] | undefined,
      isFavorite: goalEntity.data.isFavorite as boolean,
      isCustom: goalEntity.data.isCustom as boolean,
      createdAt: goalEntity.createdAt,
      updatedAt: goalEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get goal by ID:", error);
    return null;
  }
}

export async function updateGoalProgress(
  input: UpdateGoalProgressInput,
): Promise<{ success: boolean; data?: Goal; error?: string }> {
  "use server";
  try {
    const goal = await getGoalById(input.id);
    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    const progress = calculateProgress(input.currentValue, goal.targetValue);
    const now = Date.now();

    const updateData: Record<string, unknown> = {
      currentValue: input.currentValue,
      progress,
    };

    // Auto-complete if progress reaches 100%
    if (progress >= 100 && goal.status !== "completed") {
      updateData.status = "completed";
      updateData.completedAt = now;
    }

    await updateEntity(input.id, updateData);

    revalidatePath("/goals");

    const updatedGoal = await getGoalById(input.id);
    return { success: true, data: updatedGoal || undefined };
  } catch (error) {
    console.error("Failed to update goal progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function toggleGoalFavorite(
  id: string,
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  "use server";
  try {
    const goal = await getGoalById(id);
    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    await updateEntity(id, { isFavorite: !goal.isFavorite });
    revalidatePath("/goals");

    return { success: true, isFavorite: !goal.isFavorite };
  } catch (error) {
    console.error("Failed to toggle goal favorite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * =====================
 * MILESTONE ACTIONS
 * =====================
 */

export async function addMilestone(
  input: CreateMilestoneInput,
): Promise<{ success: boolean; data?: Milestone; error?: string }> {
  "use server";
  try {
    const goal = await getGoalById(input.goalId);
    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    const now = Date.now();
    const milestone: Milestone = {
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      description: input.description,
      targetValue: input.targetValue,
      currentValue: 0,
      unit: input.unit,
      deadline: input.deadline,
      status: "pending",
      order: input.order,
      createdAt: now,
      updatedAt: now,
    };

    const goalEntity = await getEntityById(input.goalId);
    if (!goalEntity) {
      return { success: false, error: "Goal not found" };
    }

    const milestones = (goalEntity.data.milestones as Milestone[]) || [];
    milestones.push(milestone);

    await updateEntity(input.goalId, { milestones });
    revalidatePath("/goals");

    return { success: true, data: milestone };
  } catch (error) {
    console.error("Failed to add milestone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateMilestone(
  input: UpdateMilestoneInput,
): Promise<{ success: boolean; data?: Milestone; error?: string }> {
  "use server";
  try {
    const goal = await getGoalById(input.id);
    if (!goal) {
      // Try to find the goal that contains this milestone
      const allGoals = await getGoals();
      const goalWithMilestone = allGoals.find((g) =>
        g.milestones.some((m) => m.id === input.id),
      );

      if (!goalWithMilestone) {
        return { success: false, error: "Milestone not found" };
      }

      const milestone = goalWithMilestone.milestones.find(
        (m) => m.id === input.id,
      );
      if (!milestone) {
        return { success: false, error: "Milestone not found" };
      }

      const now = Date.now();
      const updatedMilestone: Milestone = {
        ...milestone,
        title: input.title ?? milestone.title,
        description: input.description ?? milestone.description,
        targetValue: input.targetValue ?? milestone.targetValue,
        currentValue: input.currentValue ?? milestone.currentValue,
        status: input.status ?? milestone.status,
        completedAt:
          input.completedAt ??
          (input.status === "completed" ? now : milestone.completedAt),
        updatedAt: now,
      };

      // Update milestone in goal
      const milestones = goalWithMilestone.milestones.map((m) =>
        m.id === input.id ? updatedMilestone : m,
      );

      await updateEntity(goalWithMilestone.id, { milestones });
      revalidatePath("/goals");

      return { success: true, data: updatedMilestone };
    }

    return {
      success: false,
      error: "Milestone update not implemented for this path",
    };
  } catch (error) {
    console.error("Failed to update milestone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteMilestone(
  goalId: string,
  milestoneId: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    const goal = await getGoalById(goalId);
    if (!goal) {
      return { success: false, error: "Goal not found" };
    }

    const milestones = goal.milestones.filter((m) => m.id !== milestoneId);
    await updateEntity(goalId, { milestones });

    revalidatePath("/goals");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete milestone:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
