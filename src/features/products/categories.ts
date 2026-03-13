// Product Categories Configuration

import type { ProductCategoryType } from "./types";

export interface ProductCategory {
  id: ProductCategoryType;
  nameKey: string;
  icon: string;
  color: string;
}

export const productCategories: ProductCategory[] = [
  // Groceries
  {
    id: "groceries",
    nameKey: "products.categories.groceries",
    icon: "🛒",
    color: "bg-emerald-500",
  },
  {
    id: "dairy",
    nameKey: "products.categories.dairy",
    icon: "🥛",
    color: "bg-blue-400",
  },
  {
    id: "meat",
    nameKey: "products.categories.meat",
    icon: "🥩",
    color: "bg-red-500",
  },
  {
    id: "seafood",
    nameKey: "products.categories.seafood",
    icon: "🐟",
    color: "bg-cyan-500",
  },
  {
    id: "bakery",
    nameKey: "products.categories.bakery",
    icon: "🍞",
    color: "bg-amber-600",
  },
  {
    id: "produce",
    nameKey: "products.categories.produce",
    icon: "🥬",
    color: "bg-green-500",
  },
  {
    id: "frozen",
    nameKey: "products.categories.frozen",
    icon: "🧊",
    color: "bg-sky-300",
  },
  {
    id: "beverages",
    nameKey: "products.categories.beverages",
    icon: "🥤",
    color: "bg-indigo-400",
  },
  {
    id: "snacks",
    nameKey: "products.categories.snacks",
    icon: "🍿",
    color: "bg-orange-400",
  },
  {
    id: "pantry",
    nameKey: "products.categories.pantry",
    icon: "🥫",
    color: "bg-yellow-600",
  },
  // Supplements
  {
    id: "supplements",
    nameKey: "products.categories.supplements",
    icon: "💊",
    color: "bg-purple-500",
  },
  {
    id: "vitamins",
    nameKey: "products.categories.vitamins",
    icon: "🧪",
    color: "bg-pink-400",
  },
  {
    id: "sports_nutrition",
    nameKey: "products.categories.sports_nutrition",
    icon: "💪",
    color: "bg-red-600",
  },
  // Other
  {
    id: "household",
    nameKey: "products.categories.household",
    icon: "🧹",
    color: "bg-gray-500",
  },
  {
    id: "personal_care",
    nameKey: "products.categories.personal_care",
    icon: "🧴",
    color: "bg-rose-300",
  },
  {
    id: "other",
    nameKey: "products.categories.other",
    icon: "📦",
    color: "bg-slate-500",
  },
];

export const getCategoryById = (
  id: ProductCategoryType,
): ProductCategory | undefined => {
  return productCategories.find((cat) => cat.id === id);
};

export const getCategoryIcon = (id: ProductCategoryType): string => {
  return getCategoryById(id)?.icon || "📦";
};

export const getCategoryColor = (id: ProductCategoryType): string => {
  return getCategoryById(id)?.color || "bg-slate-500";
};
