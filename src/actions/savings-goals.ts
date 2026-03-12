"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
} from "@/entity-engine/engine";
import type { SavingsGoalEntity } from "@/entity-engine/types";

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadline?: string;
  icon?: string;
  color?: string;
  accountId?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavingsGoalInput {
  name: string;
  targetAmount: number;
  currency: string;
  deadline?: string;
  icon?: string;
  color?: string;
  accountId?: string;
  initialAmount?: number;
}

export interface UpdateSavingsGoalInput {
  id: string;
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  currency?: string;
  deadline?: string;
  icon?: string;
  color?: string;
  accountId?: string;
}

/**
 * Create a new savings goal
 */
export async function createSavingsGoal(
  input: CreateSavingsGoalInput,
): Promise<{ success: boolean; data?: SavingsGoal; error?: string }> {
  try {
    const now = Date.now();
    const deadline = input.deadline
      ? new Date(input.deadline).getTime()
      : undefined;

    const id = await createEntity<SavingsGoalEntity>({
      type: "savingsGoal",
      name: input.name,
      data: {
        name: input.name,
        targetAmount: input.targetAmount,
        currentAmount: input.initialAmount || 0,
        currency: input.currency,
        deadline,
        icon: input.icon,
        color: input.color,
        accountId: input.accountId,
      },
    });

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const goal: SavingsGoal = {
      id,
      name: input.name,
      targetAmount: input.targetAmount,
      currentAmount: input.initialAmount || 0,
      currency: input.currency,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      icon: input.icon,
      color: input.color,
      accountId: input.accountId,
      progress:
        input.targetAmount > 0
          ? ((input.initialAmount || 0) / input.targetAmount) * 100
          : 0,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    return { success: true, data: goal };
  } catch (error) {
    console.error("Failed to create savings goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing savings goal
 */
export async function updateSavingsGoal(
  input: UpdateSavingsGoalInput,
): Promise<{ success: boolean; data?: SavingsGoal; error?: string }> {
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "savingsGoal") {
      return { success: false, error: "Savings goal not found" };
    }

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.targetAmount !== undefined)
      updateData.targetAmount = input.targetAmount;
    if (input.currentAmount !== undefined)
      updateData.currentAmount = input.currentAmount;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.deadline !== undefined)
      updateData.deadline = new Date(input.deadline).getTime();
    if (input.icon !== undefined) updateData.icon = input.icon;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.accountId !== undefined) updateData.accountId = input.accountId;

    await updateEntity(input.id, updateData);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const updatedEntity = (await getEntityById(input.id)) as SavingsGoalEntity;
    const goal: SavingsGoal = {
      id: updatedEntity.id,
      name: updatedEntity.data.name,
      targetAmount: updatedEntity.data.targetAmount,
      currentAmount: updatedEntity.data.currentAmount,
      currency: updatedEntity.data.currency,
      deadline: updatedEntity.data.deadline
        ? new Date(updatedEntity.data.deadline).toISOString()
        : undefined,
      icon: updatedEntity.data.icon,
      color: updatedEntity.data.color,
      accountId: updatedEntity.data.accountId,
      progress:
        updatedEntity.data.targetAmount > 0
          ? (updatedEntity.data.currentAmount /
              updatedEntity.data.targetAmount) *
            100
          : 0,
      createdAt: new Date(updatedEntity.createdAt).toISOString(),
      updatedAt: new Date(updatedEntity.updatedAt).toISOString(),
    };

    return { success: true, data: goal };
  } catch (error) {
    console.error("Failed to update savings goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a savings goal (soft delete)
 */
export async function deleteSavingsGoal(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const entity = await getEntityById(id);
    if (!entity) {
      return { success: false, error: "Savings goal not found" };
    }

    await deleteEntity(id);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete savings goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all savings goals
 */
export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  try {
    const entities = (await getEntitiesByType(
      "savingsGoal",
      false,
    )) as SavingsGoalEntity[];

    return entities.map((entity) => ({
      id: entity.id,
      name: entity.data.name,
      targetAmount: entity.data.targetAmount,
      currentAmount: entity.data.currentAmount,
      currency: entity.data.currency,
      deadline: entity.data.deadline
        ? new Date(entity.data.deadline).toISOString()
        : undefined,
      icon: entity.data.icon,
      color: entity.data.color,
      accountId: entity.data.accountId,
      progress:
        entity.data.targetAmount > 0
          ? (entity.data.currentAmount / entity.data.targetAmount) * 100
          : 0,
      createdAt: new Date(entity.createdAt).toISOString(),
      updatedAt: new Date(entity.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get savings goals:", error);
    return [];
  }
}

/**
 * Get savings goal by ID
 */
export async function getSavingsGoalById(
  id: string,
): Promise<SavingsGoal | null> {
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "savingsGoal") {
      return null;
    }

    const goalEntity = entity as SavingsGoalEntity;
    return {
      id: goalEntity.id,
      name: goalEntity.data.name,
      targetAmount: goalEntity.data.targetAmount,
      currentAmount: goalEntity.data.currentAmount,
      currency: goalEntity.data.currency,
      deadline: goalEntity.data.deadline
        ? new Date(goalEntity.data.deadline).toISOString()
        : undefined,
      icon: goalEntity.data.icon,
      color: goalEntity.data.color,
      accountId: goalEntity.data.accountId,
      progress:
        goalEntity.data.targetAmount > 0
          ? (goalEntity.data.currentAmount / goalEntity.data.targetAmount) * 100
          : 0,
      createdAt: new Date(goalEntity.createdAt).toISOString(),
      updatedAt: new Date(goalEntity.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Failed to get savings goal:", error);
    return null;
  }
}

/**
 * Add contribution to savings goal
 */
export async function addSavingsGoalContribution(
  goalId: string,
  amount: number,
): Promise<{ success: boolean; data?: SavingsGoal; error?: string }> {
  try {
    const goal = await getSavingsGoalById(goalId);
    if (!goal) {
      return { success: false, error: "Savings goal not found" };
    }

    const newCurrentAmount = goal.currentAmount + amount;
    const result = await updateSavingsGoal({
      id: goalId,
      currentAmount: newCurrentAmount,
    });

    return result;
  } catch (error) {
    console.error("Failed to add contribution:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
