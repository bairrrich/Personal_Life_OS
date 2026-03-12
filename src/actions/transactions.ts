"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  queryEntities,
  getEntitiesByType,
  getEntityById,
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

    // Recalculate account balances
    if (input.accountId) {
      await recalculateAccountBalance(input.accountId);
    }
    if (input.toAccountId) {
      await recalculateAccountBalance(input.toAccountId);
    }

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
    // Get existing transaction to track account changes
    const existingEntity = await getEntityById(input.id);
    if (!existingEntity || existingEntity.type !== "transaction") {
      return { success: false, error: "Transaction not found" };
    }

    const existingTx = existingEntity as TransactionEntity;
    const affectedAccounts = new Set<string>();
    affectedAccounts.add(existingTx.data.accountId);
    if (existingTx.data.toAccountId) {
      affectedAccounts.add(existingTx.data.toAccountId);
    }

    // Update using Entity Engine
    const updateData: Record<string, unknown> = {};
    if (input.amount !== undefined) updateData.amount = input.amount;
    if (input.type !== undefined) updateData.transactionType = input.type;
    if (input.category !== undefined) updateData.categoryId = input.category;
    if (input.description !== undefined) updateData.note = input.description;
    if (input.date !== undefined)
      updateData.date = new Date(input.date).getTime();

    await updateEntity(input.id, updateData);

    // Recalculate balances for affected accounts
    for (const accountId of affectedAccounts) {
      await recalculateAccountBalance(accountId);
    }

    revalidatePath("/finance");
    revalidatePath("/dashboard");
    revalidatePath("/analytics");

    // Fetch updated entity
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
    // Get transaction to track affected accounts
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "transaction") {
      return { success: false, error: "Transaction not found" };
    }

    const txEntity = entity as TransactionEntity;
    const affectedAccounts = new Set<string>();
    affectedAccounts.add(txEntity.data.accountId);
    if (txEntity.data.toAccountId) {
      affectedAccounts.add(txEntity.data.toAccountId);
    }

    // Delete using Entity Engine (soft delete)
    await deleteEntity(id);

    // Recalculate balances for affected accounts
    for (const accountId of affectedAccounts) {
      await recalculateAccountBalance(accountId);
    }

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
 * Get transactions by account ID
 */
export async function getTransactionsByAccount(
  accountId: string,
): Promise<Transaction[]> {
  try {
    const entities = await queryEntities(
      {
        type: "transaction",
        deleted: false,
        data: { accountId },
      },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    return entities.map(entityToTransaction);
  } catch (error) {
    console.error("Failed to get transactions by account:", error);
    return [];
  }
}

/**
 * Recalculate account balance based on transactions
 */
export async function recalculateAccountBalance(
  accountId: string,
): Promise<number> {
  try {
    const entity = await getEntityById(accountId);
    if (!entity || entity.type !== "account") {
      return 0;
    }

    const accountEntity = entity as AccountEntity;
    const initialBalance = accountEntity.data.initialBalance || 0;

    // Get all transactions for this account
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
          te.data.accountId === accountId || te.data.toAccountId === accountId
        );
      })
      .map(entityToTransaction);

    // Calculate balance
    let balance = initialBalance;

    transactions.forEach((t) => {
      const isSourceAccount = t.type !== "transfer";
      const isDestAccount = t.type === "transfer";

      if (isSourceAccount && t.type === "income") {
        balance += t.amount;
      } else if (isSourceAccount && t.type === "expense") {
        balance -= t.amount;
      } else if (isDestAccount && t.type === "transfer") {
        balance += t.amount;
      } else if (isSourceAccount && t.type === "transfer") {
        balance -= t.amount;
      }
    });

    // Update account balance in database
    await updateEntity(accountId, { balance });

    return balance;
  } catch (error) {
    console.error("Failed to recalculate account balance:", error);
    return 0;
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

/**
 * Get spending by category for a date range
 */
export async function getSpendingByCategory(
  startDate: string,
  endDate: string,
): Promise<{ categoryId: string; amount: number; percentage: number }[]> {
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

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
          te.data.date >= start &&
          te.data.date <= end
        );
      })
      .map((e) => e as TransactionEntity);

    // Group by category
    const categoryTotals: Record<string, number> = {};
    let total = 0;

    transactions.forEach((t) => {
      const categoryId = t.data.categoryId || "other";
      categoryTotals[categoryId] =
        (categoryTotals[categoryId] || 0) + t.data.amount;
      total += t.data.amount;
    });

    // Convert to array with percentages
    return Object.entries(categoryTotals)
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  } catch (error) {
    console.error("Failed to get spending by category:", error);
    return [];
  }
}

/**
 * Get income vs expenses over time (daily)
 */
export async function getIncomeVsExpensesOverTime(
  startDate: string,
  endDate: string,
): Promise<
  Array<{
    date: string;
    income: number;
    expenses: number;
    balance: number;
  }>
> {
  try {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

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
        return te.data.date >= start && te.data.date <= end;
      })
      .map((e) => e as TransactionEntity);

    // Group by date
    const dailyData: Record<string, { income: number; expenses: number }> = {};

    transactions.forEach((t) => {
      const date = new Date(t.data.date).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expenses: 0 };
      }

      if (t.data.transactionType === "income") {
        dailyData[date].income += t.data.amount;
      } else if (t.data.transactionType === "expense") {
        dailyData[date].expenses += t.data.amount;
      }
    });

    // Convert to array
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Failed to get income vs expenses over time:", error);
    return [];
  }
}

/**
 * Get monthly totals
 */
export async function getMonthlyTotals(year: number): Promise<
  Array<{
    month: number;
    income: number;
    expenses: number;
    balance: number;
  }>
> {
  try {
    const startDate = new Date(year, 0, 1).getTime();
    const endDate = new Date(year, 11, 31).getTime();

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
        return te.data.date >= startDate && te.data.date <= endDate;
      })
      .map((e) => e as TransactionEntity);

    // Group by month
    const monthlyData: Record<number, { income: number; expenses: number }> =
      {};

    transactions.forEach((t) => {
      const month = new Date(t.data.date).getMonth();
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }

      if (t.data.transactionType === "income") {
        monthlyData[month].income += t.data.amount;
      } else if (t.data.transactionType === "expense") {
        monthlyData[month].expenses += t.data.amount;
      }
    });

    // Convert to array (ensure all months are present)
    return Array.from({ length: 12 }, (_, i) => ({
      month: i,
      income: monthlyData[i]?.income || 0,
      expenses: monthlyData[i]?.expenses || 0,
      balance: (monthlyData[i]?.income || 0) - (monthlyData[i]?.expenses || 0),
    }));
  } catch (error) {
    console.error("Failed to get monthly totals:", error);
    return [];
  }
}
