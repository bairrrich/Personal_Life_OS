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
import { createTransaction } from "./transactions";
import type { RecurringTransactionEntity } from "@/entity-engine/types";

export interface RecurringTransaction {
  id: string;
  amount: number;
  currency: string;
  transactionType: "income" | "expense";
  categoryId: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDate: string;
  accountId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionInput {
  amount: number;
  currency: string;
  transactionType: "income" | "expense";
  categoryId: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDate?: string;
  accountId: string;
  enabled?: boolean;
}

export interface UpdateRecurringTransactionInput {
  id: string;
  amount?: number;
  currency?: string;
  transactionType?: "income" | "expense";
  categoryId?: string;
  description?: string;
  frequency?: "daily" | "weekly" | "monthly" | "yearly";
  nextDate?: string;
  accountId?: string;
  enabled?: boolean;
}

/**
 * Create a new recurring transaction
 */
export async function createRecurringTransaction(
  input: CreateRecurringTransactionInput,
): Promise<{ success: boolean; data?: RecurringTransaction; error?: string }> {
  try {
    const now = Date.now();
    const nextDate = input.nextDate ? new Date(input.nextDate).getTime() : now;

    const id = await createEntity<RecurringTransactionEntity>({
      type: "recurringTransaction",
      name: input.description,
      data: {
        amount: input.amount,
        currency: input.currency,
        transactionType: input.transactionType,
        categoryId: input.categoryId,
        description: input.description,
        frequency: input.frequency,
        nextDate,
        accountId: input.accountId,
        enabled: input.enabled ?? true,
      },
    });

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const recurringTx: RecurringTransaction = {
      id,
      amount: input.amount,
      currency: input.currency,
      transactionType: input.transactionType,
      categoryId: input.categoryId,
      description: input.description,
      frequency: input.frequency,
      nextDate: new Date(nextDate).toISOString(),
      accountId: input.accountId,
      enabled: input.enabled ?? true,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    return { success: true, data: recurringTx };
  } catch (error) {
    console.error("Failed to create recurring transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing recurring transaction
 */
export async function updateRecurringTransaction(
  input: UpdateRecurringTransactionInput,
): Promise<{ success: boolean; data?: RecurringTransaction; error?: string }> {
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "recurringTransaction") {
      return { success: false, error: "Recurring transaction not found" };
    }

    const updateData: Record<string, unknown> = {};

    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.transactionType !== undefined)
      updateData.transactionType = input.transactionType;
    if (input.categoryId !== undefined)
      updateData.categoryId = input.categoryId;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.frequency !== undefined) updateData.frequency = input.frequency;
    if (input.nextDate !== undefined)
      updateData.nextDate = new Date(input.nextDate).getTime();
    if (input.accountId !== undefined) updateData.accountId = input.accountId;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;

    await updateEntity(input.id, updateData);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const updatedEntity = (await getEntityById(
      input.id,
    )) as RecurringTransactionEntity;
    const recurringTx: RecurringTransaction = {
      id: updatedEntity.id,
      amount: updatedEntity.data.amount,
      currency: updatedEntity.data.currency,
      transactionType: updatedEntity.data.transactionType,
      categoryId: updatedEntity.data.categoryId,
      description: updatedEntity.data.description,
      frequency: updatedEntity.data.frequency,
      nextDate: new Date(updatedEntity.data.nextDate).toISOString(),
      accountId: updatedEntity.data.accountId,
      enabled: updatedEntity.data.enabled ?? true,
      createdAt: new Date(updatedEntity.createdAt).toISOString(),
      updatedAt: new Date(updatedEntity.updatedAt).toISOString(),
    };

    return { success: true, data: recurringTx };
  } catch (error) {
    console.error("Failed to update recurring transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a recurring transaction (soft delete)
 */
export async function deleteRecurringTransaction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const entity = await getEntityById(id);
    if (!entity) {
      return { success: false, error: "Recurring transaction not found" };
    }

    await deleteEntity(id);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete recurring transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all recurring transactions
 */
export async function getRecurringTransactions(): Promise<
  RecurringTransaction[]
> {
  try {
    const entities = (await getEntitiesByType(
      "recurringTransaction",
      false,
    )) as RecurringTransactionEntity[];

    return entities.map((entity) => ({
      id: entity.id,
      amount: entity.data.amount,
      currency: entity.data.currency,
      transactionType: entity.data.transactionType,
      categoryId: entity.data.categoryId,
      description: entity.data.description,
      frequency: entity.data.frequency,
      nextDate: new Date(entity.data.nextDate).toISOString(),
      accountId: entity.data.accountId,
      enabled: entity.data.enabled ?? true,
      createdAt: new Date(entity.createdAt).toISOString(),
      updatedAt: new Date(entity.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get recurring transactions:", error);
    return [];
  }
}

/**
 * Process recurring transactions - create actual transactions for due dates
 */
export async function processRecurringTransactions(): Promise<{
  success: boolean;
  processed: number;
  error?: string;
}> {
  try {
    const recurringTxs = await getRecurringTransactions();
    const now = Date.now();
    let processed = 0;

    for (const tx of recurringTxs) {
      if (!tx.enabled) continue;

      const nextDate = new Date(tx.nextDate).getTime();
      if (nextDate > now) continue;

      // Create actual transaction
      const result = await createTransaction({
        amount: tx.amount,
        type: tx.transactionType,
        category: tx.categoryId,
        description: `[Recurring] ${tx.description}`,
        date: new Date(nextDate).toISOString(),
        accountId: tx.accountId,
      });

      if (result.success) {
        processed++;

        // Calculate next occurrence
        const nextOccurrence = calculateNextOccurrence(
          tx.frequency,
          new Date(tx.nextDate),
        );

        // Update next date
        await updateRecurringTransaction({
          id: tx.id,
          nextDate: nextOccurrence.toISOString(),
        });
      }
    }

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    return { success: true, processed };
  } catch (error) {
    console.error("Failed to process recurring transactions:", error);
    return {
      success: false,
      processed: 0,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Calculate next occurrence based on frequency
 */
function calculateNextOccurrence(
  frequency: "daily" | "weekly" | "monthly" | "yearly",
  fromDate: Date,
): Date {
  const next = new Date(fromDate);

  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    case "yearly":
      next.setFullYear(next.getFullYear() + 1);
      break;
  }

  return next;
}
