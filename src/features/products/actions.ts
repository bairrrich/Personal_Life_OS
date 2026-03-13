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
import type {
  ProductEntity,
  PriceHistoryEntity,
  ShoppingListItemEntity,
  ShoppingListEntity,
  PurchaseEntity,
} from "@/entity-engine/types";
import type {
  Product,
  PriceHistory,
  ShoppingListItem,
  ShoppingList,
  Purchase,
  CreateProductInput,
  UpdateProductInput,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  CreatePurchaseInput,
  ProductFilters,
} from "./types";

/**
 * =====================
 * PRODUCT ACTIONS
 * =====================
 */

export async function createProduct(
  input: CreateProductInput,
): Promise<{ success: boolean; data?: Product; error?: string }> {
  "use server";
  try {
    const now = Date.now();

    const id = await createEntity<ProductEntity>({
      type: "product",
      name: input.name,
      data: {
        brand: input.brand,
        category: input.category,
        subcategory: input.subcategory,
        description: input.description,
        image: input.image,
        barcode: input.barcode,
        defaultUnit: input.defaultUnit,
        defaultQuantity: input.defaultQuantity,
        defaultPrice: input.defaultPrice,
        currency: input.currency || "USD",
        nutritionPer100g: input.nutritionPer100g,
        tags: input.tags,
        isFavorite: false,
        isCustom: true,
      },
    });

    revalidatePath("/products");

    const product: Product = {
      id,
      name: input.name,
      brand: input.brand,
      category: input.category,
      subcategory: input.subcategory,
      description: input.description,
      image: input.image,
      barcode: input.barcode,
      defaultUnit: input.defaultUnit,
      defaultQuantity: input.defaultQuantity,
      defaultPrice: input.defaultPrice,
      currency: input.currency || "USD",
      nutritionPer100g: input.nutritionPer100g,
      tags: input.tags,
      isFavorite: false,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to create product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateProduct(
  input: UpdateProductInput,
): Promise<{ success: boolean; data?: Product; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "product") {
      return { success: false, error: "Product not found" };
    }

    const productEntity = entity as ProductEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.brand !== undefined) updateData.brand = input.brand;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.subcategory !== undefined)
      updateData.subcategory = input.subcategory;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.image !== undefined) updateData.image = input.image;
    if (input.barcode !== undefined) updateData.barcode = input.barcode;
    if (input.defaultUnit !== undefined)
      updateData.defaultUnit = input.defaultUnit;
    if (input.defaultQuantity !== undefined)
      updateData.defaultQuantity = input.defaultQuantity;
    if (input.defaultPrice !== undefined)
      updateData.defaultPrice = input.defaultPrice;
    if (input.currency !== undefined) updateData.currency = input.currency;
    if (input.nutritionPer100g !== undefined)
      updateData.nutritionPer100g = input.nutritionPer100g;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.isFavorite !== undefined)
      updateData.isFavorite = input.isFavorite;

    await updateEntity(input.id, updateData);

    revalidatePath("/products");

    const updatedEntity = (await getEntityById(input.id)) as ProductEntity;

    const product: Product = {
      id: updatedEntity.id,
      name: updatedEntity.name,
      brand: updatedEntity.data.brand as string | undefined,
      category: updatedEntity.data.category as any,
      subcategory: updatedEntity.data.subcategory as string | undefined,
      description: updatedEntity.data.description as string | undefined,
      image: updatedEntity.data.image as string | undefined,
      barcode: updatedEntity.data.barcode as string | undefined,
      defaultUnit: updatedEntity.data.defaultUnit as any,
      defaultQuantity: updatedEntity.data.defaultQuantity as number,
      defaultPrice: updatedEntity.data.defaultPrice as number | undefined,
      currency: updatedEntity.data.currency as string,
      nutritionPer100g: updatedEntity.data.nutritionPer100g as
        | {
            calories: number;
            protein: number;
            fat: number;
            carbs: number;
            fiber?: number;
            sugar?: number;
          }
        | undefined,
      tags: updatedEntity.data.tags as string[] | undefined,
      isFavorite: updatedEntity.data.isFavorite as boolean,
      isCustom: updatedEntity.data.isCustom as boolean,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: product };
  } catch (error) {
    console.error("Failed to update product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteProduct(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete product:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getProducts(
  filters?: ProductFilters,
): Promise<Product[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "product",
      false,
    )) as ProductEntity[];

    let products = entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
      brand: entity.data.brand as string | undefined,
      category: entity.data.category as any,
      subcategory: entity.data.subcategory as string | undefined,
      description: entity.data.description as string | undefined,
      image: entity.data.image as string | undefined,
      barcode: entity.data.barcode as string | undefined,
      defaultUnit: entity.data.defaultUnit as any,
      defaultQuantity: entity.data.defaultQuantity as number,
      defaultPrice: entity.data.defaultPrice as number | undefined,
      currency: entity.data.currency as string,
      nutritionPer100g: entity.data.nutritionPer100g as
        | {
            calories: number;
            protein: number;
            fat: number;
            carbs: number;
            fiber?: number;
            sugar?: number;
          }
        | undefined,
      tags: entity.data.tags as string[] | undefined,
      isFavorite: entity.data.isFavorite as boolean,
      isCustom: entity.data.isCustom as boolean,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })) as Product[];

    // Apply filters
    if (filters) {
      if (filters.category) {
        products = products.filter((p) => p.category === filters.category);
      }
      if (filters.isFavorite !== undefined) {
        products = products.filter((p) => p.isFavorite === filters.isFavorite);
      }
      if (filters.hasPrice) {
        products = products.filter((p) => p.defaultPrice !== undefined);
      }
      if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.brand?.toLowerCase().includes(searchQuery) ||
            p.description?.toLowerCase().includes(searchQuery) ||
            p.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        products = products.filter((p) =>
          p.tags?.some((tag) => filters.tags!.includes(tag)),
        );
      }
    }

    return products;
  } catch (error) {
    console.error("Failed to get products:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "product") {
      return null;
    }

    const productEntity = entity as ProductEntity;
    return {
      id: productEntity.id,
      name: productEntity.name,
      brand: productEntity.data.brand as string | undefined,
      category: productEntity.data.category as any,
      subcategory: productEntity.data.subcategory as string | undefined,
      description: productEntity.data.description as string | undefined,
      image: productEntity.data.image as string | undefined,
      barcode: productEntity.data.barcode as string | undefined,
      defaultUnit: productEntity.data.defaultUnit as any,
      defaultQuantity: productEntity.data.defaultQuantity as number,
      defaultPrice: productEntity.data.defaultPrice as number | undefined,
      currency: productEntity.data.currency as string,
      nutritionPer100g: productEntity.data.nutritionPer100g as
        | {
            calories: number;
            protein: number;
            fat: number;
            carbs: number;
            fiber?: number;
            sugar?: number;
          }
        | undefined,
      tags: productEntity.data.tags as string[] | undefined,
      isFavorite: productEntity.data.isFavorite as boolean,
      isCustom: productEntity.data.isCustom as boolean,
      createdAt: productEntity.createdAt,
      updatedAt: productEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get product by ID:", error);
    return null;
  }
}

export async function toggleProductFavorite(
  id: string,
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  "use server";
  try {
    const product = await getProductById(id);
    if (!product) {
      return { success: false, error: "Product not found" };
    }

    await updateEntity(id, { isFavorite: !product.isFavorite });
    revalidatePath("/products");

    return { success: true, isFavorite: !product.isFavorite };
  } catch (error) {
    console.error("Failed to toggle product favorite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * =====================
 * PRICE HISTORY ACTIONS
 * =====================
 */

export async function addPriceHistory(
  productId: string,
  price: number,
  quantity: number,
  unit: string,
  currency: string = "USD",
  store?: string,
): Promise<{ success: boolean; data?: PriceHistory; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const product = await getProductById(productId);

    if (!product) {
      return { success: false, error: "Product not found" };
    }

    const id = await createEntity<PriceHistoryEntity>({
      type: "priceHistory",
      name: `${product.name} - ${price} ${currency}`,
      data: {
        productId,
        price,
        currency,
        quantity,
        unit,
        store,
      },
    });

    const priceHistory: PriceHistory = {
      id,
      productId,
      price,
      currency,
      quantity,
      unit: unit as any,
      store,
      date: now,
      createdAt: now,
    };

    return { success: true, data: priceHistory };
  } catch (error) {
    console.error("Failed to add price history:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getPriceHistory(
  productId: string,
): Promise<PriceHistory[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "priceHistory",
      false,
    )) as PriceHistoryEntity[];

    return entities
      .filter((e) => e.data.productId === productId)
      .map((entity) => ({
        id: entity.id,
        productId: entity.data.productId as string,
        price: entity.data.price as number,
        currency: entity.data.currency as string,
        quantity: entity.data.quantity as number,
        unit: entity.data.unit as any,
        store: entity.data.store as string | undefined,
        date: entity.createdAt,
        createdAt: entity.createdAt,
      }))
      .sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error("Failed to get price history:", error);
    return [];
  }
}

/**
 * =====================
 * SHOPPING LIST ACTIONS
 * =====================
 */

export async function createShoppingListItem(
  input: CreateShoppingListItemInput,
): Promise<{ success: boolean; data?: ShoppingListItem; error?: string }> {
  "use server";
  try {
    const now = Date.now();

    const id = await createEntity<ShoppingListItemEntity>({
      type: "shoppingListItem",
      name: input.name,
      data: {
        productId: input.productId,
        quantity: input.quantity,
        unit: input.unit,
        estimatedPrice: input.estimatedPrice,
        currency: input.currency || "USD",
        category: input.category,
        checked: false,
        note: input.note,
      },
    });

    revalidatePath("/products");

    const item: ShoppingListItem = {
      id,
      productId: input.productId,
      name: input.name,
      quantity: input.quantity,
      unit: input.unit,
      estimatedPrice: input.estimatedPrice,
      currency: input.currency || "USD",
      category: input.category,
      checked: false,
      note: input.note,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to create shopping list item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateShoppingListItem(
  input: UpdateShoppingListItemInput,
): Promise<{ success: boolean; data?: ShoppingListItem; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "shoppingListItem") {
      return { success: false, error: "Shopping list item not found" };
    }

    const itemEntity = entity as ShoppingListItemEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.quantity !== undefined) updateData.quantity = input.quantity;
    if (input.unit !== undefined) updateData.unit = input.unit;
    if (input.estimatedPrice !== undefined)
      updateData.estimatedPrice = input.estimatedPrice;
    if (input.checked !== undefined) updateData.checked = input.checked;
    if (input.note !== undefined) updateData.note = input.note;

    await updateEntity(input.id, updateData);

    revalidatePath("/products");

    const updatedEntity = (await getEntityById(
      input.id,
    )) as ShoppingListItemEntity;

    const item: ShoppingListItem = {
      id: updatedEntity.id,
      productId: updatedEntity.data.productId as string | undefined,
      name: updatedEntity.name,
      quantity: updatedEntity.data.quantity as number,
      unit: updatedEntity.data.unit as any,
      estimatedPrice: updatedEntity.data.estimatedPrice as number | undefined,
      currency: updatedEntity.data.currency as string,
      category: updatedEntity.data.category as any,
      checked: updatedEntity.data.checked as boolean,
      note: updatedEntity.data.note as string | undefined,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: item };
  } catch (error) {
    console.error("Failed to update shopping list item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteShoppingListItem(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete shopping list item:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getShoppingListItems(): Promise<ShoppingListItem[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "shoppingListItem",
      false,
    )) as ShoppingListItemEntity[];

    return entities.map((entity) => ({
      id: entity.id,
      productId: entity.data.productId as string | undefined,
      name: entity.name,
      quantity: entity.data.quantity as number,
      unit: entity.data.unit as any,
      estimatedPrice: entity.data.estimatedPrice as number | undefined,
      currency: entity.data.currency as string,
      category: entity.data.category as any,
      checked: entity.data.checked as boolean,
      note: entity.data.note as string | undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })) as ShoppingListItem[];
  } catch (error) {
    console.error("Failed to get shopping list items:", error);
    return [];
  }
}

export async function clearCheckedShoppingItems(): Promise<{
  success: boolean;
}> {
  "use server";
  try {
    const items = await getShoppingListItems();
    const checkedItems = items.filter((item) => item.checked);

    for (const item of checkedItems) {
      await deleteEntity(item.id);
    }

    revalidatePath("/products");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear checked shopping items:", error);
    return { success: false };
  }
}

/**
 * =====================
 * PURCHASE ACTIONS
 * =====================
 */

export async function createPurchase(
  input: CreatePurchaseInput,
): Promise<{ success: boolean; data?: Purchase; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const totalAmount = input.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const id = await createEntity<PurchaseEntity>({
      type: "purchase",
      name: `Purchase ${new Date(input.date || now).toLocaleDateString()}`,
      data: {
        items: input.items,
        totalAmount,
        currency: input.items[0]?.currency || "USD",
        store: input.store,
        note: input.note,
      },
    });

    // Add price history for each product
    for (const item of input.items) {
      if (item.productId) {
        await addPriceHistory(
          item.productId,
          item.price,
          item.quantity,
          item.unit,
          item.currency,
          input.store,
        );
      }
    }

    revalidatePath("/products");

    const purchase: Purchase = {
      id,
      items: input.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit as any,
        price: item.price,
        currency: item.currency,
      })),
      totalAmount,
      currency: input.items[0]?.currency || "USD",
      store: input.store,
      date: input.date || now,
      createdAt: now,
    };

    return { success: true, data: purchase };
  } catch (error) {
    console.error("Failed to create purchase:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getPurchases(): Promise<Purchase[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "purchase",
      false,
    )) as PurchaseEntity[];

    return entities.map((entity) => ({
      id: entity.id,
      items: entity.data.items as Purchase["items"],
      totalAmount: entity.data.totalAmount as number,
      currency: entity.data.currency as string,
      store: entity.data.store as string | undefined,
      date: entity.createdAt,
      createdAt: entity.createdAt,
    }));
  } catch (error) {
    console.error("Failed to get purchases:", error);
    return [];
  }
}

export async function getPurchaseById(id: string): Promise<Purchase | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "purchase") {
      return null;
    }

    const purchaseEntity = entity as PurchaseEntity;
    return {
      id: purchaseEntity.id,
      items: purchaseEntity.data.items as Purchase["items"],
      totalAmount: purchaseEntity.data.totalAmount as number,
      currency: purchaseEntity.data.currency as string,
      store: purchaseEntity.data.store as string | undefined,
      date: purchaseEntity.createdAt,
      createdAt: purchaseEntity.createdAt,
    };
  } catch (error) {
    console.error("Failed to get purchase by ID:", error);
    return null;
  }
}
