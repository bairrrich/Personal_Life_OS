import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculatePortionMacros } from "../utils";
import type { FoodItem } from "../types";

// Mock food item for testing
const mockFood: FoodItem = {
  id: "test_food",
  name: "Test Food",
  servingSize: 100,
  macros: {
    calories: 200,
    protein: 10,
    fat: 5,
    carbs: 30,
    fiber: 3,
    sugar: 8,
  },
  isCustom: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

describe("Nutrition Utils", () => {
  describe("calculatePortionMacros", () => {
    it("should calculate macros for 1 serving", () => {
      const result = calculatePortionMacros(mockFood, 1);

      expect(result.calories).toBe(200);
      expect(result.protein).toBe(10);
      expect(result.fat).toBe(5);
      expect(result.carbs).toBe(30);
      expect(result.fiber).toBe(3);
      expect(result.sugar).toBe(8);
    });

    it("should calculate macros for multiple servings", () => {
      const result = calculatePortionMacros(mockFood, 2);

      expect(result.calories).toBe(400);
      expect(result.protein).toBe(20);
      expect(result.fat).toBe(10);
      expect(result.carbs).toBe(60);
      expect(result.fiber).toBe(6);
      expect(result.sugar).toBe(16);
    });

    it("should calculate macros for fractional servings", () => {
      const result = calculatePortionMacros(mockFood, 0.5);

      expect(result.calories).toBe(100);
      expect(result.protein).toBe(5);
      expect(result.fat).toBe(2.5);
      expect(result.carbs).toBe(15);
      expect(result.fiber).toBe(1.5);
      expect(result.sugar).toBe(4);
    });

    it("should handle food without optional macros", () => {
      const foodWithoutOptional: FoodItem = {
        id: "test_food_2",
        name: "Test Food 2",
        servingSize: 100,
        macros: {
          calories: 150,
          protein: 8,
          fat: 3,
          carbs: 25,
        },
        isCustom: true,
      };

      const result = calculatePortionMacros(foodWithoutOptional, 1);

      expect(result.calories).toBe(150);
      expect(result.protein).toBe(8);
      expect(result.fat).toBe(3);
      expect(result.carbs).toBe(25);
      expect(result.fiber).toBeUndefined();
      expect(result.sugar).toBeUndefined();
    });

    it("should handle different serving sizes", () => {
      const foodWithDifferentServing: FoodItem = {
        ...mockFood,
        servingSize: 50,
      };

      // 2 servings of 50g = 100g total, should equal 1 serving of 100g
      const result = calculatePortionMacros(foodWithDifferentServing, 2);

      expect(result.calories).toBe(400);
      expect(result.protein).toBe(20);
      expect(result.fat).toBe(10);
      expect(result.carbs).toBe(60);
    });

    it("should round calories to whole numbers", () => {
      const foodWithFractional: FoodItem = {
        id: "test_food_3",
        name: "Test Food 3",
        servingSize: 100,
        macros: {
          calories: 199.6,
          protein: 10.1,
          fat: 5.1,
          carbs: 30.1,
        },
        isCustom: true,
      };

      const result = calculatePortionMacros(foodWithFractional, 1);

      expect(result.calories).toBe(200); // Rounded
    });

    it("should round macros to 1 decimal place", () => {
      const foodWithFractional: FoodItem = {
        id: "test_food_4",
        name: "Test Food 4",
        servingSize: 100,
        macros: {
          calories: 200,
          protein: 10.15,
          fat: 5.15,
          carbs: 30.15,
        },
        isCustom: true,
      };

      const result = calculatePortionMacros(foodWithFractional, 1);

      expect(result.protein).toBe(10.2);
      expect(result.fat).toBe(5.2);
      expect(result.carbs).toBe(30.2);
    });
  });
});
