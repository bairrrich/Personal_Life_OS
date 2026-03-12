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
import type { BudgetEntity, TransactionEntity } from "@/entity-engine/types";

export interface Budget {
  id: string;
  amount: number;
  currency: string;
  categoryId: string;
  categoryName: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  spent?: number;
  remaining?: number;
  percentUsed?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetInput {
  amount: number;
  currency: string;
  categoryId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  startDate?: string;
}

export interface UpdateBudgetInput {
  id: string;
  amount?: number;
  currency?: string;
  categoryId?: string;
  period?: "daily" | "weekly" | "monthly" | "yearly";
}

/**
 * Create a new budget
 */
export async function createBudget(
  input: CreateBudgetInput,
): Promise<{ success: boolean; data?: Budget; error?: string }> {
  try {
    const now = Date.now();
    const startDate = input.startDate
      ? new Date(input.startDate).getTime()
      : now;

    let endDate: number | undefined;
    if (input.period === "daily") {
      endDate = startDate + 24 * 60 * 60 * 1000;
    } else if (input.period === "weekly") {
      endDate = startDate + 7 * 24 * 60 * 60 * 1000;
    } else if (input.period === "monthly") {
      const date = new Date(startDate);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0).getTime();
    } else if (input.period === "yearly") {
      const date = new Date(startDate);
      endDate = new Date(date.getFullYear(), 11, 31).getTime();
    }

    const id = await createEntity<BudgetEntity>({
      type: "budget",
      name: `Budget ${input.period}`,
      data: {
        amount: input.amount,
        currency: input.currency,
        categoryId: input.categoryId,
        period: input.period,
        startDate,
        endDate,
      },
    });

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const budget: Budget = {
      id,
      amount: input.amount,
      currency: input.currency,
      categoryId: input.categoryId,
      categoryName: "",
      period: input.period,
      startDate: new Date(startDate).toISOString(),
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    return { success: true, data: budget };
  } catch (error) {
    console.error("Failed to create budget:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing budget
 */
export async function updateBudget(
  input: UpdateBudgetInput,
): Promise<{ success: boolean; data?: Budget; error?: string }> {
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "budget") {
      return { success: false, error: "Budget not found" };
    }

    const _budgetEntity = entity as BudgetEntity;
    const updateData: Record<string, unknown> = {};

    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.categoryId !== undefined)
      updateData.categoryId = input.categoryId;
    if (input.period !== undefined) updateData.period = input.period;

    await updateEntity(input.id, updateData);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const updatedEntity = (await getEntityById(input.id)) as BudgetEntity;
    const budget: Budget = {
      id: updatedEntity.id,
      amount: updatedEntity.data.amount,
      currency: updatedEntity.data.currency,
      categoryId: updatedEntity.data.categoryId,
      categoryName: "",
      period: updatedEntity.data.period,
      startDate: new Date(updatedEntity.data.startDate).toISOString(),
      endDate: updatedEntity.data.endDate
        ? new Date(updatedEntity.data.endDate).toISOString()
        : undefined,
      createdAt: new Date(updatedEntity.createdAt).toISOString(),
      updatedAt: new Date(updatedEntity.updatedAt).toISOString(),
    };

    return { success: true, data: budget };
  } catch (error) {
    console.error("Failed to update budget:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a budget (soft delete)
 */
export async function deleteBudget(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const entity = await getEntityById(id);
    if (!entity) {
      return { success: false, error: "Budget not found" };
    }

    await deleteEntity(id);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete budget:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all budgets with spending data
 */
export async function getBudgets(): Promise<Budget[]> {
  try {
    const entities = (await getEntitiesByType(
      "budget",
      false,
    )) as BudgetEntity[];

    const budgets: Budget[] = entities.map((entity) => ({
      id: entity.id,
      amount: entity.data.amount,
      currency: entity.data.currency,
      categoryId: entity.data.categoryId,
      categoryName: "",
      period: entity.data.period,
      startDate: new Date(entity.data.startDate).toISOString(),
      endDate: entity.data.endDate
        ? new Date(entity.data.endDate).toISOString()
        : undefined,
      createdAt: new Date(entity.createdAt).toISOString(),
      updatedAt: new Date(entity.updatedAt).toISOString(),
    }));

    // Calculate spending for each budget
    const budgetsWithSpending = await Promise.all(
      budgets.map(async (budget) => {
        const spending = await calculateCategorySpending(
          budget.categoryId,
          new Date(budget.startDate).getTime(),
          budget.endDate ? new Date(budget.endDate).getTime() : Date.now(),
        );

        const remaining = budget.amount - spending;
        const percentUsed = (spending / budget.amount) * 100;

        return {
          ...budget,
          spent: spending,
          remaining,
          percentUsed: Math.min(percentUsed, 100),
        };
      }),
    );

    return budgetsWithSpending;
  } catch (error) {
    console.error("Failed to get budgets:", error);
    return [];
  }
}

/**
 * Get budget by ID
 */
export async function getBudgetById(id: string): Promise<Budget | null> {
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "budget") {
      return null;
    }

    const budgetEntity = entity as BudgetEntity;
    const spending = await calculateCategorySpending(
      budgetEntity.data.categoryId,
      budgetEntity.data.startDate,
      budgetEntity.data.endDate || Date.now(),
    );

    const remaining = budgetEntity.data.amount - spending;
    const percentUsed = (spending / budgetEntity.data.amount) * 100;

    return {
      id: budgetEntity.id,
      amount: budgetEntity.data.amount,
      currency: budgetEntity.data.currency,
      categoryId: budgetEntity.data.categoryId,
      categoryName: "",
      period: budgetEntity.data.period,
      startDate: new Date(budgetEntity.data.startDate).toISOString(),
      endDate: budgetEntity.data.endDate
        ? new Date(budgetEntity.data.endDate).toISOString()
        : undefined,
      spent: spending,
      remaining,
      percentUsed: Math.min(percentUsed, 100),
      createdAt: new Date(budgetEntity.createdAt).toISOString(),
      updatedAt: new Date(budgetEntity.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Failed to get budget:", error);
    return null;
  }
}

/**
 * Calculate spending for a category in a date range
 */
async function calculateCategorySpending(
  categoryId: string,
  startDate: number,
  endDate: number,
): Promise<number> {
  try {
    const entities = await queryEntities(
      {
        type: "transaction",
        deleted: false,
      },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    const transactions = entities
      .filter((e) => {
        const te = e as TransactionEntity;
        return (
          te.data.transactionType === "expense" &&
          te.data.categoryId === categoryId &&
          te.data.date >= startDate &&
          te.data.date <= endDate
        );
      })
      .map((e) => (e as TransactionEntity).data.amount);

    return transactions.reduce((sum, amount) => sum + amount, 0);
  } catch (error) {
    console.error("Failed to calculate spending:", error);
    return 0;
  }
}
