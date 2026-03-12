// Nutrition categories and food groups

export type FoodCategoryType =
  | "proteins"
  | "carbs"
  | "fats"
  | "vegetables"
  | "fruits"
  | "dairy"
  | "grains"
  | "legumes"
  | "nuts_seeds"
  | "beverages"
  | "snacks"
  | "other";

export interface FoodCategory {
  id: string;
  nameKey: string; // i18n key
  type: FoodCategoryType;
  icon: string;
  color: string;
}

export const foodCategories: FoodCategory[] = [
  {
    id: "proteins",
    nameKey: "nutrition.categories.proteins",
    type: "proteins",
    icon: "🥩",
    color: "red",
  },
  {
    id: "carbs",
    nameKey: "nutrition.categories.carbs",
    type: "carbs",
    icon: "🍞",
    color: "amber",
  },
  {
    id: "fats",
    nameKey: "nutrition.categories.fats",
    type: "fats",
    icon: "🫒",
    color: "yellow",
  },
  {
    id: "vegetables",
    nameKey: "nutrition.categories.vegetables",
    type: "vegetables",
    icon: "🥬",
    color: "green",
  },
  {
    id: "fruits",
    nameKey: "nutrition.categories.fruits",
    type: "fruits",
    icon: "🍎",
    color: "pink",
  },
  {
    id: "dairy",
    nameKey: "nutrition.categories.dairy",
    type: "dairy",
    icon: "🥛",
    color: "blue",
  },
  {
    id: "grains",
    nameKey: "nutrition.categories.grains",
    type: "grains",
    icon: "🌾",
    color: "orange",
  },
  {
    id: "legumes",
    nameKey: "nutrition.categories.legumes",
    type: "legumes",
    icon: "🫘",
    color: "brown",
  },
  {
    id: "nuts_seeds",
    nameKey: "nutrition.categories.nuts_seeds",
    type: "nuts_seeds",
    icon: "🥜",
    color: "stone",
  },
  {
    id: "beverages",
    nameKey: "nutrition.categories.beverages",
    type: "beverages",
    icon: "🥤",
    color: "cyan",
  },
  {
    id: "snacks",
    nameKey: "nutrition.categories.snacks",
    type: "snacks",
    icon: "🍿",
    color: "purple",
  },
  {
    id: "other",
    nameKey: "nutrition.categories.other",
    type: "other",
    icon: "🍽️",
    color: "gray",
  },
];

export function getFoodCategoryById(id: string): FoodCategory | undefined {
  return foodCategories.find((c) => c.id === id);
}

export function getCategoriesByType(type: FoodCategoryType): FoodCategory[] {
  return foodCategories.filter((c) => c.type === type);
}

// Default food items database (can be expanded)
export interface DefaultFoodItem {
  id: string;
  nameKey: string;
  categoryId: string;
  calories: number; // per 100g
  protein: number; // per 100g
  fat: number; // per 100g
  carbs: number; // per 100g
  fiber?: number; // per 100g
  sugar?: number; // per 100g
}

export const defaultFoods: DefaultFoodItem[] = [
  // Proteins
  {
    id: "chicken_breast",
    nameKey: "nutrition.foods.chicken_breast",
    categoryId: "proteins",
    calories: 165,
    protein: 31,
    fat: 3.6,
    carbs: 0,
  },
  {
    id: "salmon",
    nameKey: "nutrition.foods.salmon",
    categoryId: "proteins",
    calories: 208,
    protein: 20,
    fat: 13,
    carbs: 0,
  },
  {
    id: "eggs",
    nameKey: "nutrition.foods.eggs",
    categoryId: "proteins",
    calories: 155,
    protein: 13,
    fat: 11,
    carbs: 1.1,
  },
  {
    id: "tuna",
    nameKey: "nutrition.foods.tuna",
    categoryId: "proteins",
    calories: 132,
    protein: 26,
    fat: 1,
    carbs: 0,
  },
  // Carbs
  {
    id: "rice_white",
    nameKey: "nutrition.foods.rice_white",
    categoryId: "grains",
    calories: 130,
    protein: 2.7,
    fat: 0.3,
    carbs: 28,
  },
  {
    id: "pasta",
    nameKey: "nutrition.foods.pasta",
    categoryId: "grains",
    calories: 131,
    protein: 5,
    fat: 1.1,
    carbs: 25,
  },
  {
    id: "bread_white",
    nameKey: "nutrition.foods.bread_white",
    categoryId: "grains",
    calories: 265,
    protein: 9,
    fat: 3.2,
    carbs: 49,
  },
  {
    id: "oats",
    nameKey: "nutrition.foods.oats",
    categoryId: "grains",
    calories: 389,
    protein: 17,
    fat: 7,
    carbs: 66,
    fiber: 10,
  },
  // Vegetables
  {
    id: "broccoli",
    nameKey: "nutrition.foods.broccoli",
    categoryId: "vegetables",
    calories: 34,
    protein: 2.8,
    fat: 0.4,
    carbs: 7,
    fiber: 2.6,
  },
  {
    id: "spinach",
    nameKey: "nutrition.foods.spinach",
    categoryId: "vegetables",
    calories: 23,
    protein: 2.9,
    fat: 0.4,
    carbs: 3.6,
    fiber: 2.2,
  },
  {
    id: "carrots",
    nameKey: "nutrition.foods.carrots",
    categoryId: "vegetables",
    calories: 41,
    protein: 0.9,
    fat: 0.2,
    carbs: 10,
    fiber: 2.8,
  },
  // Fruits
  {
    id: "banana",
    nameKey: "nutrition.foods.banana",
    categoryId: "fruits",
    calories: 89,
    protein: 1.1,
    fat: 0.3,
    carbs: 23,
    fiber: 2.6,
    sugar: 12,
  },
  {
    id: "apple",
    nameKey: "nutrition.foods.apple",
    categoryId: "fruits",
    calories: 52,
    protein: 0.3,
    fat: 0.2,
    carbs: 14,
    fiber: 2.4,
    sugar: 10,
  },
  {
    id: "orange",
    nameKey: "nutrition.foods.orange",
    categoryId: "fruits",
    calories: 47,
    protein: 0.9,
    fat: 0.1,
    carbs: 12,
    fiber: 2.4,
    sugar: 9,
  },
  // Dairy
  {
    id: "milk",
    nameKey: "nutrition.foods.milk",
    categoryId: "dairy",
    calories: 42,
    protein: 3.4,
    fat: 1,
    carbs: 5,
  },
  {
    id: "cheese_cheddar",
    nameKey: "nutrition.foods.cheese_cheddar",
    categoryId: "dairy",
    calories: 403,
    protein: 25,
    fat: 33,
    carbs: 1.3,
  },
  {
    id: "yogurt_greek",
    nameKey: "nutrition.foods.yogurt_greek",
    categoryId: "dairy",
    calories: 59,
    protein: 10,
    fat: 0.4,
    carbs: 3.6,
  },
  // Nuts & Seeds
  {
    id: "almonds",
    nameKey: "nutrition.foods.almonds",
    categoryId: "nuts_seeds",
    calories: 579,
    protein: 21,
    fat: 50,
    carbs: 22,
    fiber: 12,
  },
  {
    id: "walnuts",
    nameKey: "nutrition.foods.walnuts",
    categoryId: "nuts_seeds",
    calories: 654,
    protein: 15,
    fat: 65,
    carbs: 14,
    fiber: 7,
  },
  // Legumes
  {
    id: "lentils",
    nameKey: "nutrition.foods.lentils",
    categoryId: "legumes",
    calories: 116,
    protein: 9,
    fat: 0.4,
    carbs: 20,
    fiber: 8,
  },
  {
    id: "chickpeas",
    nameKey: "nutrition.foods.chickpeas",
    categoryId: "legumes",
    calories: 164,
    protein: 9,
    fat: 2.6,
    carbs: 27,
    fiber: 8,
  },
  // Fats
  {
    id: "olive_oil",
    nameKey: "nutrition.foods.olive_oil",
    categoryId: "fats",
    calories: 884,
    protein: 0,
    fat: 100,
    carbs: 0,
  },
  {
    id: "avocado",
    nameKey: "nutrition.foods.avocado",
    categoryId: "fats",
    calories: 160,
    protein: 2,
    fat: 15,
    carbs: 9,
    fiber: 7,
  },
  // Beverages
  {
    id: "coffee_black",
    nameKey: "nutrition.foods.coffee_black",
    categoryId: "beverages",
    calories: 2,
    protein: 0.3,
    fat: 0,
    carbs: 0,
  },
  {
    id: "tea",
    nameKey: "nutrition.foods.tea",
    categoryId: "beverages",
    calories: 1,
    protein: 0,
    fat: 0,
    carbs: 0.2,
  },
];

export function getDefaultFoodById(id: string): DefaultFoodItem | undefined {
  return defaultFoods.find((f) => f.id === id);
}

export function getDefaultFoodsByCategory(
  categoryId: string,
): DefaultFoodItem[] {
  return defaultFoods.filter((f) => f.categoryId === categoryId);
}
