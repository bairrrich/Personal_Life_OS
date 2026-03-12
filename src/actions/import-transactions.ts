"use server";

import { createTransaction, type CreateTransactionInput } from "./transactions";

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors?: string[];
}

/**
 * Parse CSV content and import transactions
 */
export async function importTransactionsFromCSV(
  csvContent: string,
): Promise<ImportResult> {
  try {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    if (lines.length < 2) {
      return { success: false, imported: 0, failed: 0, errors: ["Empty CSV"] };
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const requiredFields = ["date", "type", "amount", "description"];
    const missingFields = requiredFields.filter(
      (field) => !headers.includes(field),
    );

    if (missingFields.length > 0) {
      return {
        success: false,
        imported: 0,
        failed: 0,
        errors: [`Missing required fields: ${missingFields.join(", ")}`],
      };
    }

    const errors: string[] = [];
    let imported = 0;
    let failed = 0;

    // Process each row (skip header)
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};

        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || "";
        });

        // Validate and convert data
        const amount = parseFloat(row["amount"]);
        if (isNaN(amount) || amount <= 0) {
          throw new Error(`Invalid amount: ${row["amount"]}`);
        }

        const type = row["type"]?.toLowerCase();
        if (!["income", "expense", "transfer"].includes(type)) {
          throw new Error(`Invalid type: ${row["type"]}`);
        }

        const date = row["date"]
          ? new Date(row["date"]).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        // Create transaction
        const input: CreateTransactionInput = {
          amount,
          type: type as "income" | "expense" | "transfer",
          category: row["category"] || "other",
          description: row["description"]?.replace(/^"|"$/g, "") || "",
          date,
          accountId: row["account"] || "default",
        };

        const result = await createTransaction(input);

        if (result.success) {
          imported++;
        } else {
          failed++;
          errors.push(`Row ${i + 1}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        errors.push(
          `Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return {
      success: failed === 0,
      imported,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    console.error("Failed to import transactions:", error);
    return {
      success: false,
      imported: 0,
      failed: 0,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}
