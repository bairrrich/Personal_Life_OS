// Products Module Types

export type ProductCategoryType =
  | "groceries"
  | "dairy"
  | "meat"
  | "seafood"
  | "bakery"
  | "produce"
  | "frozen"
  | "beverages"
  | "snacks"
  | "pantry"
  | "supplements"
  | "vitamins"
  | "sports_nutrition"
  | "household"
  | "personal_care"
  | "other";

export type UnitType =
  | "piece"
  | "kg"
  | "g"
  | "l"
  | "ml"
  | "oz"
  | "lb"
  | "pack"
  | "box"
  | "bottle"
  | "can";

export interface Product {
  id: string;
  name: string;
  brand?: string;
  category: ProductCategoryType;
  subcategory?: string;
  description?: string;
  image?: string;
  barcode?: string;
  defaultUnit: UnitType;
  defaultQuantity: number;
  defaultPrice?: number;
  currency: string;
  nutritionPer100g?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
  };
  tags?: string[];
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  currency: string;
  quantity: number;
  unit: UnitType;
  store?: string;
  date: number;
  createdAt: number;
}

export interface ShoppingListItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: UnitType;
  estimatedPrice?: number;
  currency: string;
  category?: ProductCategoryType;
  checked: boolean;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingListItem[];
  createdAt: number;
  updatedAt: number;
}

export interface Purchase {
  id: string;
  items: PurchaseItem[];
  totalAmount: number;
  currency: string;
  store?: string;
  date: number;
  note?: string;
  createdAt: number;
}

export interface PurchaseItem {
  productId?: string;
  name: string;
  quantity: number;
  unit: UnitType;
  price: number;
  currency: string;
  categoryId?: string;
}

export interface CreateProductInput {
  name: string;
  brand?: string;
  category: ProductCategoryType;
  subcategory?: string;
  description?: string;
  image?: string;
  barcode?: string;
  defaultUnit: UnitType;
  defaultQuantity: number;
  defaultPrice?: number;
  currency: string;
  nutritionPer100g?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
  };
  tags?: string[];
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  brand?: string;
  category?: ProductCategoryType;
  subcategory?: string;
  description?: string;
  image?: string;
  barcode?: string;
  defaultUnit?: UnitType;
  defaultQuantity?: number;
  defaultPrice?: number;
  currency?: string;
  nutritionPer100g?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber?: number;
    sugar?: number;
  };
  tags?: string[];
  isFavorite?: boolean;
}

export interface CreateShoppingListItemInput {
  productId?: string;
  name: string;
  quantity: number;
  unit: UnitType;
  estimatedPrice?: number;
  currency?: string;
  category?: ProductCategoryType;
  note?: string;
}

export interface UpdateShoppingListItemInput {
  id: string;
  name?: string;
  quantity?: number;
  unit?: UnitType;
  estimatedPrice?: number;
  checked?: boolean;
  note?: string;
}

export interface CreatePurchaseInput {
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    unit: UnitType;
    price: number;
    currency: string;
  }>;
  store?: string;
  date?: number;
  note?: string;
}

export interface ProductFilters {
  category?: ProductCategoryType;
  search?: string;
  isFavorite?: boolean;
  hasPrice?: boolean;
  tags?: string[];
}

export interface ProductStats {
  totalProducts: number;
  favoriteProducts: number;
  customProducts: number;
  categoriesCount: Record<string, number>;
  avgPrice?: number;
  currency: string;
}

export interface PriceComparison {
  productId: string;
  currentPrice?: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceHistory: PriceHistory[];
}
