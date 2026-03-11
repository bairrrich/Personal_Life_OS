// Validators for Entity Engine
import { schemas } from "./schema-registry";
import type { BaseEntity } from "./types";

export interface ZodErrorLike {
  message: string;
  path: (string | number)[];
}

export interface ValidationResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: ZodErrorLike[];
}

export function validateEntityData<T extends BaseEntity["data"]>(
  type: string,
  data: unknown,
): ValidationResult<T> {
  const schema = schemas[type];

  if (!schema) {
    return {
      success: false,
      errors: [{ message: `Unknown entity type: ${type}`, path: [] }],
    };
  }

  const result = schema.zodSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data as T };
  }

  // Convert Zod issues to our format
  const errors = result.error.issues.map((issue) => ({
    message: issue.message,
    path: issue.path as (string | number)[],
  }));
  return { success: false, errors };
}

export function validateEntity<T extends BaseEntity>(
  entity: Omit<T, "id" | "createdAt" | "updatedAt">,
): ValidationResult<T> {
  const { type, name, data } = entity;

  const schema = schemas[type];
  if (!schema) {
    return {
      success: false,
      errors: [{ message: `Unknown entity type: ${type}`, path: ["type"] }],
    };
  }

  if (!name || typeof name !== "string") {
    return {
      success: false,
      errors: [{ message: "Name is required", path: ["name"] }],
    };
  }

  const dataResult = validateEntityData(type, data);
  if (!dataResult.success) return dataResult as ValidationResult<T>;

  return { success: true, data: entity as T };
}
