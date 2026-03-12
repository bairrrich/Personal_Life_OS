"use server";

import { getTransactions } from "./transactions";

/**
 * Export transactions to CSV format
 */
export async function exportTransactionsToCSV(): Promise<{
  success: boolean;
  csv?: string;
  error?: string;
}> {
  try {
    const transactions = await getTransactions();

    // CSV Header
    const headers = [
      "ID",
      "Date",
      "Type",
      "Category",
      "Description",
      "Amount",
      "Currency",
    ];

    // CSV Rows
    const rows = transactions.map((t) => [
      t.id,
      new Date(t.date).toISOString(),
      t.type,
      t.category,
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes in description
      t.amount.toFixed(2),
      "USD",
    ]);

    // Combine header and rows
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return { success: true, csv };
  } catch (error) {
    console.error("Failed to export transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
