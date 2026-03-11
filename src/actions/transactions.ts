'use server'

import { revalidatePath } from 'next/cache'
import { generateId } from '@/lib/utils'

export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionInput {
  amount: number
  type: 'income' | 'expense'
  category: string
  description: string
  date?: string
}

export interface UpdateTransactionInput {
  id: string
  amount?: number
  type?: 'income' | 'expense'
  category?: string
  description?: string
  date?: string
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  input: CreateTransactionInput
): Promise<{ success: boolean; data?: Transaction; error?: string }> {
  try {
    const now = new Date().toISOString()
    
    const transaction: Transaction = {
      id: generateId(),
      amount: input.amount,
      type: input.type,
      category: input.category,
      description: input.description,
      date: input.date || now,
      createdAt: now,
      updatedAt: now,
    }

    // TODO: Implement database insertion
    // For now, store in localStorage as fallback
    if (typeof window !== 'undefined') {
      const transactions = getStoredTransactions()
      transactions.push(transaction)
      localStorage.setItem('transactions', JSON.stringify(transactions))
    }

    revalidatePath('/finance')
    revalidatePath('/dashboard')
    revalidatePath('/analytics')

    return { success: true, data: transaction }
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  input: UpdateTransactionInput
): Promise<{ success: boolean; data?: Transaction; error?: string }> {
  try {
    const now = new Date().toISOString()

    // TODO: Implement database update
    // For now, update in localStorage as fallback
    if (typeof window !== 'undefined') {
      const transactions = getStoredTransactions()
      const index = transactions.findIndex((t) => t.id === input.id)

      if (index === -1) {
        return { success: false, error: 'Transaction not found' }
      }

      const updatedTransaction: Transaction = {
        ...transactions[index],
        amount: input.amount ?? transactions[index].amount,
        type: input.type ?? transactions[index].type,
        category: input.category ?? transactions[index].category,
        description: input.description ?? transactions[index].description,
        date: input.date ?? transactions[index].date,
        updatedAt: now,
      }

      transactions[index] = updatedTransaction
      localStorage.setItem('transactions', JSON.stringify(transactions))

      revalidatePath('/finance')
      revalidatePath('/dashboard')
      revalidatePath('/analytics')

      return { success: true, data: updatedTransaction }
    }

    return { success: false, error: 'Server-side update not implemented yet' }
  } catch (error) {
    console.error('Failed to update transaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // TODO: Implement database deletion
    // For now, delete from localStorage as fallback
    if (typeof window !== 'undefined') {
      const transactions = getStoredTransactions()
      const filteredTransactions = transactions.filter((t) => t.id !== id)

      if (filteredTransactions.length === transactions.length) {
        return { success: false, error: 'Transaction not found' }
      }

      localStorage.setItem('transactions', JSON.stringify(filteredTransactions))

      revalidatePath('/finance')
      revalidatePath('/dashboard')
      revalidatePath('/analytics')

      return { success: true }
    }

    return { success: false, error: 'Server-side delete not implemented yet' }
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Get all transactions
 */
export async function getTransactions(): Promise<Transaction[]> {
  // TODO: Implement database fetch
  // For now, get from localStorage as fallback
  if (typeof window !== 'undefined') {
    return getStoredTransactions()
  }

  return []
}

/**
 * Get transactions by date range
 */
export async function getTransactionsByDateRange(
  startDate: string,
  endDate: string
): Promise<Transaction[]> {
  const transactions = await getTransactions()
  return transactions.filter(
    (t) => t.date >= startDate && t.date <= endDate
  )
}

/**
 * Get total income and expenses
 */
export async function getTransactionSummary(): Promise<{
  totalIncome: number
  totalExpenses: number
  balance: number
}> {
  const transactions = await getTransactions()

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  }
}

/**
 * Helper function to get stored transactions from localStorage
 */
function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') {
    return []
  }

  const stored = localStorage.getItem('transactions')
  if (!stored) {
    return []
  }

  try {
    return JSON.parse(stored) as Transaction[]
  } catch {
    return []
  }
}
