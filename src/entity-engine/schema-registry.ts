// Schema Registry for Entity Engine
import { z } from "zod";

export interface EntitySchema {
  type: string;
  fields: Array<{
    name: string;
    type: "string" | "number" | "boolean" | "object";
    label: string;
    required?: boolean;
  }>;
  zodSchema: z.ZodType;
}

export const schemas: Record<string, EntitySchema> = {
  transaction: {
    type: "transaction",
    fields: [
      { name: "amount", type: "number", label: "Amount", required: true },
      { name: "currency", type: "string", label: "Currency", required: true },
      {
        name: "transactionType",
        type: "string",
        label: "Type",
        required: true,
      },
      { name: "categoryId", type: "string", label: "Category", required: true },
      { name: "date", type: "number", label: "Date", required: true },
      { name: "note", type: "string", label: "Note" },
      {
        name: "transferAccountId",
        type: "string",
        label: "Transfer To Account",
      },
    ],
    zodSchema: z.object({
      amount: z.number().positive(),
      currency: z.string(),
      transactionType: z.enum(["income", "expense", "transfer"]),
      categoryId: z.string(),
      date: z.number(),
      note: z.string().optional(),
      transferAccountId: z.string().optional(),
    }),
  },
  account: {
    type: "account",
    fields: [
      { name: "name", type: "string", label: "Name", required: true },
      { name: "currency", type: "string", label: "Currency", required: true },
      { name: "balance", type: "number", label: "Balance", required: true },
      {
        name: "initialBalance",
        type: "number",
        label: "Initial Balance",
        required: true,
      },
    ],
    zodSchema: z.object({
      name: z.string(),
      currency: z.string(),
      balance: z.number(),
      initialBalance: z.number(),
    }),
  },
  food: {
    type: "food",
    fields: [
      { name: "calories", type: "number", label: "Calories", required: true },
      { name: "protein", type: "number", label: "Protein", required: true },
      { name: "fat", type: "number", label: "Fat", required: true },
      { name: "carbs", type: "number", label: "Carbs", required: true },
      { name: "barcode", type: "string", label: "Barcode" },
      { name: "brand", type: "string", label: "Brand" },
    ],
    zodSchema: z.object({
      calories: z.number(),
      protein: z.number(),
      fat: z.number(),
      carbs: z.number(),
      barcode: z.string().optional(),
      brand: z.string().optional(),
    }),
  },
  meal: {
    type: "meal",
    fields: [
      { name: "date", type: "number", label: "Date", required: true },
      { name: "mealType", type: "string", label: "Meal Type", required: true },
    ],
    zodSchema: z.object({
      date: z.number(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    }),
  },
  exercise: {
    type: "exercise",
    fields: [
      { name: "muscleGroup", type: "string", label: "Muscle Group" },
      { name: "equipment", type: "string", label: "Equipment" },
      { name: "difficulty", type: "string", label: "Difficulty" },
    ],
    zodSchema: z.object({
      muscleGroup: z.string().optional(),
      equipment: z.string().optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    }),
  },
  workout: {
    type: "workout",
    fields: [
      { name: "date", type: "number", label: "Date", required: true },
      { name: "duration", type: "number", label: "Duration" },
      { name: "note", type: "string", label: "Note" },
    ],
    zodSchema: z.object({
      date: z.number(),
      duration: z.number().optional(),
      note: z.string().optional(),
    }),
  },
  category: {
    type: "category",
    fields: [
      { name: "name", type: "string", label: "Name", required: true },
      { name: "type", type: "string", label: "Type", required: true },
      { name: "color", type: "string", label: "Color" },
      { name: "icon", type: "string", label: "Icon" },
      { name: "parentId", type: "string", label: "Parent Category" },
    ],
    zodSchema: z.object({
      name: z.string(),
      type: z.enum(["income", "expense"]),
      color: z.string().optional(),
      icon: z.string().optional(),
      parentId: z.string().optional(),
    }),
  },
  budget: {
    type: "budget",
    fields: [
      { name: "amount", type: "number", label: "Amount", required: true },
      { name: "currency", type: "string", label: "Currency", required: true },
      { name: "categoryId", type: "string", label: "Category", required: true },
      { name: "period", type: "string", label: "Period", required: true },
      {
        name: "startDate",
        type: "number",
        label: "Start Date",
        required: true,
      },
      { name: "endDate", type: "number", label: "End Date" },
    ],
    zodSchema: z.object({
      amount: z.number().positive(),
      currency: z.string(),
      categoryId: z.string(),
      period: z.enum(["daily", "weekly", "monthly", "yearly"]),
      startDate: z.number(),
      endDate: z.number().optional(),
    }),
  },
};

export function getSchema(type: string): EntitySchema | undefined {
  return schemas[type];
}

export function getAllSchemas(): Record<string, EntitySchema> {
  return schemas;
}
