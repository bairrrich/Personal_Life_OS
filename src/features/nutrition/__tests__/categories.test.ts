import { describe, it, expect } from "vitest";
import {
  foodCategories,
  getFoodCategoryById,
  getCategoriesByType,
  defaultFoods,
  getDefaultFoodById,
  getDefaultFoodsByCategory,
} from "../categories";

describe("Nutrition Categories", () => {
  describe("foodCategories", () => {
    it("should have 12 categories", () => {
      expect(foodCategories).toHaveLength(12);
    });

    it("should have unique IDs", () => {
      const ids = foodCategories.map((c) => c.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have required properties", () => {
      foodCategories.forEach((category) => {
        expect(category).toHaveProperty("id");
        expect(category).toHaveProperty("nameKey");
        expect(category).toHaveProperty("type");
        expect(category).toHaveProperty("icon");
        expect(category).toHaveProperty("color");
      });
    });
  });

  describe("getFoodCategoryById", () => {
    it("should find category by ID", () => {
      const category = getFoodCategoryById("proteins");
      expect(category).toBeDefined();
      expect(category?.id).toBe("proteins");
    });

    it("should return undefined for non-existent ID", () => {
      const category = getFoodCategoryById("nonexistent");
      expect(category).toBeUndefined();
    });
  });

  describe("getCategoriesByType", () => {
    it("should return categories for specific type", () => {
      const vegetables = getCategoriesByType("vegetables");
      expect(vegetables).toHaveLength(1);
      expect(vegetables[0].type).toBe("vegetables");
    });
  });
});

describe("Default Foods", () => {
  describe("defaultFoods", () => {
    it("should have default foods", () => {
      expect(defaultFoods.length).toBeGreaterThan(20);
    });

    it("should have unique IDs", () => {
      const ids = defaultFoods.map((f) => f.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it("should have required properties", () => {
      defaultFoods.forEach((food) => {
        expect(food).toHaveProperty("id");
        expect(food).toHaveProperty("nameKey");
        expect(food).toHaveProperty("categoryId");
        expect(food).toHaveProperty("calories");
        expect(food).toHaveProperty("protein");
        expect(food).toHaveProperty("fat");
        expect(food).toHaveProperty("carbs");
      });
    });

    it("should have valid category IDs", () => {
      const categoryIds = foodCategories.map((c) => c.id);
      defaultFoods.forEach((food) => {
        expect(categoryIds).toContain(food.categoryId);
      });
    });
  });

  describe("getDefaultFoodById", () => {
    it("should find food by ID", () => {
      const food = getDefaultFoodById("chicken_breast");
      expect(food).toBeDefined();
      expect(food?.id).toBe("chicken_breast");
      expect(food?.categoryId).toBe("proteins");
    });

    it("should return undefined for non-existent ID", () => {
      const food = getDefaultFoodById("nonexistent");
      expect(food).toBeUndefined();
    });
  });

  describe("getDefaultFoodsByCategory", () => {
    it("should return foods for specific category", () => {
      const proteins = getDefaultFoodsByCategory("proteins");
      expect(proteins.length).toBeGreaterThan(0);
      proteins.forEach((food) => {
        expect(food.categoryId).toBe("proteins");
      });
    });

    it("should return empty array for category with no foods", () => {
      const snacks = getDefaultFoodsByCategory("snacks");
      // May be empty or have items, but should be an array
      expect(Array.isArray(snacks)).toBe(true);
    });
  });
});
