"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  queryEntities,
  getEntitiesByType,
} from "@/entity-engine/engine";
import type { TransactionEntity, AccountEntity } from "@/entity-engine/types";

export interface Transaction {
  id: string;
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionInput {
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  description: string;
  date?: string;
  accountId?: string;
  toAccountId?: string; // For transfers
}

export interface UpdateTransactionInput {
  id: string;
  amount?: number;
  type?: "income" | "expense";
  category?: string;
  description?: string;
  date?: string;
}

/**
 * Create a new transaction using Entity Engine
 *
 * @param input - Transaction input data
 * @param input.amount - Transaction amount (must be positive)
 * @param input.type - Transaction type (income/expense/transfer)
 * @param input.category - Category ID
 * @param input.description - Transaction description
 * @param input.date - Transaction date (ISO string)
 * @param input.accountId - Source account ID
 * @param input.toAccountId - Destination account ID (for transfers only)
 * @returns Object with success status and transaction data or error
 *
 * @example
 * ```typescript
 * const result = await createTransaction({
 *   amount: 100,
 *   type: "expense",
 *   category: "food",
 *   description: "Grocery shopping",
 *   date: "2026-03-11",
 *   accountId: "bank_card",
 * })
 * ```
 */
export async function createTransaction(
  input: CreateTransactionInput,
): Promise<{ success: boolean; data?: Transaction; error?: string }> {
  try {
    const now = Date.now();
    const dateValue = input.date ? new Date(input.date).getTime() : now;

    // Create transaction entity using Entity Engine
    const id = await createEntity<TransactionEntity>({
      type: "transaction",
      name: input.description,
      data: {
        amount: input.amount,
        currency: "USD",
        accountId: input.accountId || "default",
        categoryId: input.category,
        transactionType: input.type,
        date: dateValue,
        note: input.description,
        toAccountId: input.toAccountId, // For transfers
      },
    });

    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    const transaction: Transaction = {
      id,
      amount: input.amount,
      type: input.type,
      category: input.category,
      description: input.description,
      date: input.date || new Date().toISOString(),
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    return { success: true, data: transaction };
  } catch (error) {
    console.error("Failed to create transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing transaction using Entity Engine
 */
export async function updateTransaction(
  input: UpdateTransactionInput,
): Promise<{ success: boolean; data?: Transaction; error?: string }> {
  try {
    // Update using Entity Engine
    const updateData: Record<string, unknown> = {};
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.type !== undefined) updateData.transactionType = input.type;
    if (input.category !== undefined) updateData.categoryId = input.category;
    if (input.description !== undefined) updateData.note = input.description;
    if (input.date !== undefined)
      updateData.date = new Date(input.date).getTime();

    await updateEntity(input.id, updateData);

    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    // Fetch updated entity
    const { getEntityById } = await import("@/entity-engine/engine");
    const entity = await getEntityById(input.id);

    if (!entity) {
      return { success: false, error: "Transaction not found" };
    }

    const transaction = entityToTransaction(entity);
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Failed to update transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a transaction using Entity Engine (soft delete)
 */
export async function deleteTransaction(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete using Entity Engine (soft delete)
    await deleteEntity(id);

    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all transactions using Entity Engine
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    // Get transactions using Entity Engine
    const entities = await queryEntities(
      { type: "transaction", deleted: false },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    return entities.map(entityToTransaction);
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return [];
  }
}

/**
 * Get transactions by date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string,
): Promise<Transaction[]> {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  try {
    const entities = await queryEntities(
      {
        type: "transaction",
        deleted: false,
        createdAt: { gte: start, lte: end },
      },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    return entities.map(entityToTransaction);
  } catch (error) {
    console.error("Failed to get transactions by date range:", error);
    return [];
  }
}

/**
 * Get total income and expenses
 */
export async function getTransactionSummary(): Promise<{
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}> {
  const transactions = await getTransactions();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}

/**
 * Get accounts using Entity Engine
 */
export async function getAccounts(): Promise<
  Array<{ id: string; name: string }>
> {
  try {
    const entities = (await getEntitiesByType(
      "account",
      false,
    )) as AccountEntity[];
    return entities.map((a) => ({ id: a.id, name: a.data.name }));
  } catch (error) {
    console.error("Failed to get accounts:", error);
    return [];
  }
}

/**
 * Get categories using Entity Engine
 */
export async function getCategories(): Promise<
  Array<{ id: string; name: string; color: string }>
> {
  try {
    // TODO: Implement categories when schema is added
    return [];
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [];
  }
}

/**
 * Helper: Convert Entity to Transaction
 */
function entityToTransaction(entity: unknown): Transaction {
  const e = entity as TransactionEntity;
  return {
    id: e.id,
    amount: e.data.amount,
    type: e.data.transactionType,
    category: e.data.categoryId || "",
    description: e.data.note || e.name,
    date: new Date(e.data.date).toISOString(),
    createdAt: new Date(e.createdAt).toISOString(),
    updatedAt: new Date(e.updatedAt).toISOString(),
  };
}
