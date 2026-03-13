// Products Module - Client-side hooks and utilities

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Product,
  PriceHistory,
  ShoppingListItem,
  Purchase,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
  CreateShoppingListItemInput,
  UpdateShoppingListItemInput,
  CreatePurchaseInput,
} from "./types";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  toggleProductFavorite,
  addPriceHistory,
  getPriceHistory,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  getShoppingListItems,
  clearCheckedShoppingItems,
  createPurchase,
  getPurchases,
  getPurchaseById,
} from "./actions";

// Re-export ProductFilters for convenience
export type { ProductFilters };

/**
 * Hook for managing products
 */
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(filters);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    loading,
    error,
    refresh: loadProducts,
  };
}

/**
 * Hook for managing a single product
 */
export function useProduct(id?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const update = async (input: UpdateProductInput) => {
    const result = await updateProduct(input);
    if (result.success && result.data) {
      setProduct(result.data);
    }
    return result;
  };

  const remove = async () => {
    if (!id) return { success: false, error: "No product ID" };
    const result = await deleteProduct(id);
    if (result.success) {
      setProduct(null);
    }
    return result;
  };

  const toggleFavorite = async () => {
    if (!id) return { success: false, error: "No product ID" };
    const result = await toggleProductFavorite(id);
    if (result.success && product) {
      setProduct({ ...product, isFavorite: result.isFavorite || false });
    }
    return result;
  };

  return {
    product,
    loading,
    error,
    refresh: loadProduct,
    update,
    remove,
    toggleFavorite,
  };
}

/**
 * Hook for managing shopping list
 */
export function useShoppingList() {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getShoppingListItems();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load shopping list",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = async (input: CreateShoppingListItemInput) => {
    const result = await createShoppingListItem(input);
    if (result.success && result.data) {
      setItems((prev) => [...prev, result.data!]);
    }
    return result;
  };

  const updateItem = async (input: UpdateShoppingListItemInput) => {
    const result = await updateShoppingListItem(input);
    if (result.success && result.data) {
      setItems((prev) =>
        prev.map((item) => (item.id === input.id ? result.data! : item)),
      );
    }
    return result;
  };

  const removeItem = async (id: string) => {
    const result = await deleteShoppingListItem(id);
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
    return result;
  };

  const toggleChecked = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return { success: false, error: "Item not found" };

    const result = await updateShoppingListItem({
      id,
      checked: !item.checked,
    });

    if (result.success && result.data) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? result.data! : item)),
      );
    }
    return result;
  };

  const clearChecked = async () => {
    const result = await clearCheckedShoppingItems();
    if (result.success) {
      setItems((prev) => prev.filter((item) => !item.checked));
    }
    return result;
  };

  const totalEstimated = items.reduce((sum, item) => {
    if (item.estimatedPrice && !item.checked) {
      return sum + item.estimatedPrice;
    }
    return sum;
  }, 0);

  return {
    items,
    loading,
    error,
    refresh: loadItems,
    addItem,
    updateItem,
    removeItem,
    toggleChecked,
    clearChecked,
    totalEstimated,
  };
}

/**
 * Hook for managing price history
 */
export function usePriceHistory(productId?: string) {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getPriceHistory(productId);
      setHistory(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load price history",
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addPrice = async (
    price: number,
    quantity: number,
    unit: string,
    currency?: string,
    store?: string,
  ) => {
    if (!productId) return { success: false, error: "No product ID" };

    const result = await addPriceHistory(
      productId,
      price,
      quantity,
      unit,
      currency,
      store,
    );

    if (result.success && result.data) {
      setHistory((prev) => [result.data!, ...prev]);
    }
    return result;
  };

  return {
    history,
    loading,
    error,
    refresh: loadHistory,
    addPrice,
  };
}

/**
 * Hook for managing purchases
 */
export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPurchases();
      setPurchases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load purchases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const addPurchase = async (input: CreatePurchaseInput) => {
    const result = await createPurchase(input);
    if (result.success && result.data) {
      setPurchases((prev) => [result.data!, ...prev]);
    }
    return result;
  };

  return {
    purchases,
    loading,
    error,
    refresh: loadPurchases,
    addPurchase,
  };
}

/**
 * Hook for creating/editing products
 */
export function useProductForm(onSuccess?: () => void, initialData?: Product) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: CreateProductInput | UpdateProductInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = initialData
        ? await updateProduct(data as UpdateProductInput)
        : await createProduct(data as CreateProductInput);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Operation failed");
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submit,
  };
}

// Re-export actions for direct use
export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProductById,
  toggleProductFavorite,
  addPriceHistory,
  getPriceHistory,
  createShoppingListItem,
  updateShoppingListItem,
  deleteShoppingListItem,
  getShoppingListItems,
  clearCheckedShoppingItems,
  createPurchase,
  getPurchases,
  getPurchaseById,
};
