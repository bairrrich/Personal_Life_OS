// Products Module Utilities

import type {
  Product,
  PriceHistory,
  ShoppingListItem,
  Purchase,
  ProductStats,
  PriceComparison,
} from "./types";

interface NutritionMacros {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber?: number;
  sugar?: number;
}

/**
 * Calculate price per unit (e.g., price per 100g or per 1L)
 */
export function calculatePricePerUnit(
  price: number,
  quantity: number,
  unit: string,
): number {
  const baseQuantity = unit === "kg" || unit === "l" ? 1 : 100;
  return (price / quantity) * baseQuantity;
}

/**
 * Compare two prices and return the difference percentage
 */
export function calculatePriceDifference(
  oldPrice: number,
  newPrice: number,
): number {
  if (oldPrice === 0) return 0;
  return ((newPrice - oldPrice) / oldPrice) * 100;
}

/**
 * Calculate total cost for a shopping list
 */
export function calculateShoppingListTotal(items: ShoppingListItem[]): number {
  return items.reduce((total, item) => {
    if (item.estimatedPrice && item.checked === false) {
      return total + item.estimatedPrice;
    }
    return total;
  }, 0);
}

/**
 * Calculate purchase total
 */
export function calculatePurchaseTotal(items: Purchase["items"]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Get average price from price history
 */
export function getAveragePrice(history: PriceHistory[]): number {
  if (history.length === 0) return 0;
  const total = history.reduce((sum, record) => sum + record.price, 0);
  return total / history.length;
}

/**
 * Get min price from price history
 */
export function getMinPrice(history: PriceHistory[]): number {
  if (history.length === 0) return 0;
  return Math.min(...history.map((record) => record.price));
}

/**
 * Get max price from price history
 */
export function getMaxPrice(history: PriceHistory[]): number {
  if (history.length === 0) return 0;
  return Math.max(...history.map((record) => record.price));
}

/**
 * Get current/best price for a product
 */
export function getCurrentPrice(
  product: Product,
  priceHistory: PriceHistory[] = [],
): number | undefined {
  if (product.defaultPrice) {
    return product.defaultPrice;
  }
  if (priceHistory.length > 0) {
    const sorted = [...priceHistory].sort((a, b) => b.date - a.date);
    return sorted[0].price;
  }
  return undefined;
}

/**
 * Get price comparison for a product
 */
export function getPriceComparison(
  product: Product,
  priceHistory: PriceHistory[],
): PriceComparison {
  const currentPrice = getCurrentPrice(product, priceHistory);
  const avgPrice = getAveragePrice(priceHistory);
  const minPrice = getMinPrice(priceHistory);
  const maxPrice = getMaxPrice(priceHistory);

  return {
    productId: product.id,
    currentPrice,
    avgPrice,
    minPrice,
    maxPrice,
    priceHistory,
  };
}

/**
 * Calculate product statistics
 */
export function calculateProductStats(
  products: Product[],
  currency: string = "USD",
): ProductStats {
  const stats: ProductStats = {
    totalProducts: products.length,
    favoriteProducts: products.filter((p) => p.isFavorite).length,
    customProducts: products.filter((p) => p.isCustom).length,
    categoriesCount: {},
    currency,
  };

  products.forEach((product) => {
    const category = product.category;
    stats.categoriesCount[category] =
      (stats.categoriesCount[category] || 0) + 1;
  });

  const productsWithPrice = products.filter(
    (p) => p.defaultPrice !== undefined,
  );
  if (productsWithPrice.length > 0) {
    stats.avgPrice =
      productsWithPrice.reduce((sum, p) => sum + (p.defaultPrice || 0), 0) /
      productsWithPrice.length;
  }

  return stats;
}

/**
 * Format nutrition info for display
 */
export function formatNutritionInfo(
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
  },
  perQuantity: number = 100,
): string {
  if (!nutrition) return "";

  const parts = [`${Math.round(nutrition.calories)} kcal`];

  if (perQuantity !== 100) {
    parts.push(`per ${perQuantity}g`);
  }

  return parts.join(" ");
}

/**
 * Check if product is on sale (current price is lower than average)
 */
export function isOnSale(
  currentPrice: number | undefined,
  avgPrice: number,
): boolean {
  if (!currentPrice || avgPrice === 0) return false;
  return currentPrice < avgPrice * 0.9; // 10% lower than average
}

/**
 * Calculate savings compared to average price
 */
export function calculateSavings(
  currentPrice: number | undefined,
  avgPrice: number,
  quantity: number = 1,
): number {
  if (!currentPrice || avgPrice === 0) return 0;
  const savingsPerUnit = avgPrice - currentPrice;
  return savingsPerUnit > 0 ? savingsPerUnit * quantity : 0;
}

/**
 * Convert nutrition values to per 100g basis
 */
export function convertToPer100g(
  nutrition: NutritionMacros,
  servingSize: number,
): NutritionMacros {
  const factor = 100 / servingSize;
  return {
    calories: Math.round(nutrition.calories * factor),
    protein: Math.round(nutrition.protein * factor * 10) / 10,
    fat: Math.round(nutrition.fat * factor * 10) / 10,
    carbs: Math.round(nutrition.carbs * factor * 10) / 10,
    fiber: nutrition.fiber
      ? Math.round(nutrition.fiber * factor * 10) / 10
      : undefined,
    sugar: nutrition.sugar
      ? Math.round(nutrition.sugar * factor * 10) / 10
      : undefined,
  };
}

/**
 * Sort products by various criteria
 */
export function sortProducts(
  products: Product[],
  sortBy: "name" | "price" | "category" | "createdAt" | "updatedAt",
  sortOrder: "asc" | "desc" = "asc",
): Product[] {
  return [...products].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "price":
        comparison = (a.defaultPrice || 0) - (b.defaultPrice || 0);
        break;
      case "category":
        comparison = a.category.localeCompare(b.category);
        break;
      case "createdAt":
        comparison = a.createdAt - b.createdAt;
        break;
      case "updatedAt":
        comparison = a.updatedAt - b.updatedAt;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
}

/**
 * Filter products by search query
 */
export function filterProductsBySearch(
  products: Product[],
  query: string,
): Product[] {
  if (!query.trim()) return products;

  const searchQuery = query.toLowerCase().trim();

  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery) ||
      product.brand?.toLowerCase().includes(searchQuery) ||
      product.description?.toLowerCase().includes(searchQuery) ||
      product.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
  );
}

/**
 * Generate a unique ID for shopping list items
 */
export function generateShoppingListItemId(): string {
  return `sli_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
