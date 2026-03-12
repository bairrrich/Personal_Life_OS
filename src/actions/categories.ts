"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
} from "@/entity-engine/engine";
import type { CategoryEntity } from "@/entity-engine/types";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  parentId?: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryInput {
  id: string;
  name?: string;
  type?: "income" | "expense";
  color?: string;
  icon?: string;
  parentId?: string;
}

/**
 * Create a new custom category
 */
export async function createCategory(
  input: CreateCategoryInput,
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const now = Date.now();

    const id = await createEntity<CategoryEntity>({
      type: "category",
      name: input.name,
      data: {
        name: input.name,
        type: input.type,
        color: input.color,
        icon: input.icon,
        parentId: input.parentId,
        isCustom: true,
      },
    });

    revalidatePath("/finance");
    revalidatePath("/finance/categories");

    const category: Category = {
      id,
      name: input.name,
      type: input.type,
      color: input.color,
      icon: input.icon,
      parentId: input.parentId,
      isCustom: true,
      createdAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };

    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to create category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update an existing category
 */
export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<{ success: boolean; data?: Category; error?: string }> {
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "category") {
      return { success: false, error: "Category not found" };
    }

    const updateData: Record<string, unknown> = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.color !== undefined) updateData.color = input.color;
    if (input.icon !== undefined) updateData.icon = input.icon;
    if (input.parentId !== undefined) updateData.parentId = input.parentId;

    await updateEntity(input.id, updateData);

    revalidatePath("/finance");
    revalidatePath("/finance/categories");

    const updatedEntity = (await getEntityById(input.id)) as CategoryEntity;
    const category: Category = {
      id: updatedEntity.id,
      name: updatedEntity.data.name,
      type: updatedEntity.data.type,
      color: updatedEntity.data.color,
      icon: updatedEntity.data.icon,
      parentId: updatedEntity.data.parentId,
      isCustom: updatedEntity.data.isCustom ?? true,
      createdAt: new Date(updatedEntity.createdAt).toISOString(),
      updatedAt: new Date(updatedEntity.updatedAt).toISOString(),
    };

    return { success: true, data: category };
  } catch (error) {
    console.error("Failed to update category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Delete a category (soft delete)
 */
export async function deleteCategory(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const entity = await getEntityById(id);
    if (!entity) {
      return { success: false, error: "Category not found" };
    }

    const categoryEntity = entity as CategoryEntity;
    if (!categoryEntity.data.isCustom) {
      return {
        success: false,
        error: "Cannot delete built-in categories",
      };
    }

    await deleteEntity(id);

    revalidatePath("/finance");
    revalidatePath("/finance/categories");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get all categories (built-in + custom)
 */
export async function getCategories(): Promise<Category[]> {
  try {
    // Get custom categories from database
    const customEntities = (await getEntitiesByType(
      "category",
      false,
    )) as CategoryEntity[];

    const customCategories: Category[] = customEntities.map((entity) => ({
      id: entity.id,
      name: entity.data.name,
      type: entity.data.type,
      color: entity.data.color,
      icon: entity.data.icon,
      parentId: entity.data.parentId,
      isCustom: entity.data.isCustom ?? true,
      createdAt: new Date(entity.createdAt).toISOString(),
      updatedAt: new Date(entity.updatedAt).toISOString(),
    }));

    return customCategories;
  } catch (error) {
    console.error("Failed to get categories:", error);
    return [];
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "category") {
      return null;
    }

    const categoryEntity = entity as CategoryEntity;
    return {
      id: categoryEntity.id,
      name: categoryEntity.data.name,
      type: categoryEntity.data.type,
      color: categoryEntity.data.color,
      icon: categoryEntity.data.icon,
      parentId: categoryEntity.data.parentId,
      isCustom: categoryEntity.data.isCustom ?? true,
      createdAt: new Date(categoryEntity.createdAt).toISOString(),
      updatedAt: new Date(categoryEntity.updatedAt).toISOString(),
    };
  } catch (error) {
    console.error("Failed to get category:", error);
    return null;
  }
}

/**
 * Get categories by type
 */
export async function getCategoriesByType(
  type: "income" | "expense",
): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.type === type);
}
