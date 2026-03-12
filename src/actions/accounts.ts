"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
} from "@/entity-engine/engine";
import type { AccountEntity } from "@/entity-engine/types";

export interface Account {
  id: string;
  name: string;
  currency: string;
  balance: number;
  initialBalance: number;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountInput {
  name: string;
  currency: string;
  initialBalance: number;
  icon?: string;
  color?: string;
}

export interface UpdateAccountInput {
  id: string;
  name?: string;
  currency?: string;
  initialBalance?: number;
  icon?: string;
  color?: string;
}

/**
 * Create a new account
 */
export async function createAccount(
  input: CreateAccountInput,
): Promise<{ success: boolean; data?: Account; error?: string }> {
  try {
    const now = Date.now();

    const id = await createEntity<AccountEntity>({
      type: "account",
      name: input.name,
      data: {
        name: input.name,
        currency: input.currency,
        balance: input.initialBalance,
        initialBalance: input.initialBalance,
        icon: input.icon,
        color: input.color,
      },
    });

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const account: Account = {
      id,
      name: input.name,
      currency: input.currency,
      balance: input.initialBalance,
      initialBalance: input.initialBalance,
      icon: input.icon,
      color: input.color,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    return { success: true, data: account };
  } catch (error) {
    console.error("Failed to create account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing account
 */
export async function updateAccount(
  input: UpdateAccountInput,
): Promise<{ success: boolean; data?: Account; error?: string }> {
  try {
    const entity = await getEntityById(input.id);
    if (!entity) {
      return { success: false, error: "Account not found" };
    }

    const _accountEntity = entity as AccountEntity;
    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.currency !== undefined) {
      updateData.currency = input.currency;
    }
    if (input.initialBalance !== undefined) {
      updateData.initialBalance = input.initialBalance;
      // Recalculate balance based on transactions
      const { recalculateAccountBalance } = await import("./transactions");
      const newBalance = await recalculateAccountBalance(input.id);
      updateData.balance = newBalance;
    }
    if (input.icon !== undefined) {
      updateData.icon = input.icon;
    }
    if (input.color !== undefined) {
      updateData.color = input.color;
    }

    await updateEntity(input.id, updateData);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    const updatedEntity = (await getEntityById(input.id)) as AccountEntity;
    const account: Account = {
      id: updatedEntity.id,
      name: updatedEntity.data.name,
      currency: updatedEntity.data.currency,
      balance: updatedEntity.data.balance,
      initialBalance: updatedEntity.data.initialBalance,
      icon: updatedEntity.data.icon,
      color: updatedEntity.data.color,
      createdAt: new Date(updatedEntity.createdAt).toISOString(),
      updatedAt: new Date(updatedEntity.updatedAt).toISOString(),
    };

    return { success: true, data: account };
  } catch (error) {
    console.error("Failed to update account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete an account (soft delete)
 */
export async function deleteAccount(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const entity = await getEntityById(id);
    if (!entity) {
      return { success: false, error: "Account not found" };
    }

    // Check if account has transactions
    const { getTransactionsByAccount } = await import("./transactions");
    const transactions = await getTransactionsByAccount(id);
    if (transactions.length > 0) {
      return {
        success: false,
        error: "Cannot delete account with existing transactions",
      };
    }

    await deleteEntity(id);

    revalidatePath("/finance");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all accounts
 */
export async function getAccounts(): Promise<Account[]> {
  try {
    const entities = (await getEntitiesByType(
      "account",
      false,
    )) as AccountEntity[];

    return entities.map((entity) => ({
      id: entity.id,
      name: entity.data.name,
      currency: entity.data.currency,
      balance: entity.data.balance,
      initialBalance: entity.data.initialBalance,
      icon: entity.data.icon,
      color: entity.data.color,
      createdAt: new Date(entity.createdAt).toISOString(),
      updatedAt: new Date(entity.updatedAt).toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get accounts:", error);
    return [];
  }
}

/**
 * Get account by ID
 */
export async function getAccountById(id: string): Promise<Account | null> {
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "account") {
      return null;
    }

    const accountEntity = entity as AccountEntity;
    return {
      id: accountEntity.id,
      name: accountEntity.data.name,
      currency: accountEntity.data.currency,
      balance: accountEntity.data.balance,
      initialBalance: accountEntity.data.initialBalance,
      icon: accountEntity.data.icon,
      color: accountEntity.data.color,
      createdAt: new Date(accountEntity.createdAt).toISOString(),
      updatedAt: new Date(accountEntity.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Failed to get account:", error);
    return null;
  }
}

/**
 * Get total balance across all accounts
 */
export async function getTotalBalance(): Promise<{
  total: number;
  byCurrency: Record<string, number>;
}> {
  const accounts = await getAccounts();
  const byCurrency: Record<string, number> = {};

  accounts.forEach((account) => {
    if (!byCurrency[account.currency]) {
      byCurrency[account.currency] = 0;
    }
    byCurrency[account.currency] += account.balance;
  });

  const total = Object.values(byCurrency).reduce(
    (sum, balance) => sum + balance,
    0,
  );

  return { total, byCurrency };
}
