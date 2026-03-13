// Nutrition Analytics Actions

"use server";

import { queryEntities } from "@/entity-engine/engine";
import type { MealEntity } from "@/entity-engine/types";
import type { NutritionMacros } from "./types";

export interface DailyNutrition {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface WeeklyNutrition {
  weekStart: string;
  weekEnd: string;
  avgCalories: number;
  avgProtein: number;
  avgFat: number;
  avgCarbs: number;
  totalCalories: number;
}

export interface MonthlyNutrition {
  month: number; // 0-11
  year: number;
  avgCalories: number;
  avgProtein: number;
  avgFat: number;
  avgCarbs: number;
  totalCalories: number;
  daysTracked: number;
}

export interface NutritionTrend {
  period: "week" | "month";
  data: WeeklyNutrition[] | MonthlyNutrition[];
}

/**
 * Get start of day
 */
function getStartOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get start of week (Monday)
 */
function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get nutrition data for the last N days
 */
export async function getNutritionForDays(
  days: number,
): Promise<DailyNutrition[]> {
  "use server";
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const startTimestamp = getStartOfDay(startDate).getTime();
    const endTimestamp = getStartOfDay(endDate).getTime() + 24 * 60 * 60 * 1000;

    const entities = await queryEntities(
      {
        type: "meal",
        deleted: false,
      },
      { sortBy: "createdAt", sortOrder: "desc" },
    );

    const mealEntities = entities as MealEntity[];

    // Group meals by date
    const dailyData: Record<string, NutritionMacros> = {};

    mealEntities.forEach((entity) => {
      const mealDate = entity.data.date as number;
      if (mealDate >= startTimestamp && mealDate <= endTimestamp) {
        const dateStr = new Date(mealDate).toISOString().split("T")[0];
        const macros = entity.data.totalMacros as NutritionMacros | undefined;

        if (macros) {
          if (!dailyData[dateStr]) {
            dailyData[dateStr] = { calories: 0, protein: 0, fat: 0, carbs: 0 };
          }
          dailyData[dateStr].calories += macros.calories;
          dailyData[dateStr].protein += macros.protein;
          dailyData[dateStr].fat += macros.fat;
          dailyData[dateStr].carbs += macros.carbs;
        }
      }
    });

    // Convert to array and fill missing days
    const result: DailyNutrition[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const data = dailyData[dateStr] || {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
      };

      result.push({
        date: dateStr,
        calories: Math.round(data.calories),
        protein: Math.round(data.protein * 10) / 10,
        fat: Math.round(data.fat * 10) / 10,
        carbs: Math.round(data.carbs * 10) / 10,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  } catch (error) {
    console.error("Failed to get nutrition for days:", error);
    return [];
  }
}

/**
 * Get weekly nutrition summary for the last N weeks
 */
export async function getWeeklyNutrition(
  weeks: number,
): Promise<WeeklyNutrition[]> {
  "use server";
  try {
    const dailyData = await getNutritionForDays(weeks * 7);
    const weeklyData: WeeklyNutrition[] = [];

    for (let i = 0; i < weeks; i++) {
      const weekEndIndex = dailyData.length - 1 - i * 7;
      const weekStartIndex = Math.max(0, weekEndIndex - 6);
      const weekDays = dailyData.slice(weekStartIndex, weekEndIndex + 1);

      if (weekDays.length === 0) continue;

      const totalCalories = weekDays.reduce(
        (sum, day) => sum + day.calories,
        0,
      );
      const totalProtein = weekDays.reduce((sum, day) => sum + day.protein, 0);
      const totalFat = weekDays.reduce((sum, day) => sum + day.fat, 0);
      const totalCarbs = weekDays.reduce((sum, day) => sum + day.carbs, 0);

      const weekStart = new Date(weekDays[0].date);
      const weekEnd = new Date(weekDays[weekDays.length - 1].date);

      weeklyData.unshift({
        weekStart: weekStart.toISOString().split("T")[0],
        weekEnd: weekEnd.toISOString().split("T")[0],
        avgCalories: Math.round(totalCalories / weekDays.length),
        avgProtein: Math.round((totalProtein / weekDays.length) * 10) / 10,
        avgFat: Math.round((totalFat / weekDays.length) * 10) / 10,
        avgCarbs: Math.round((totalCarbs / weekDays.length) * 10) / 10,
        totalCalories: Math.round(totalCalories),
      });
    }

    return weeklyData;
  } catch (error) {
    console.error("Failed to get weekly nutrition:", error);
    return [];
  }
}

/**
 * Get monthly nutrition summary for the last N months
 */
export async function getMonthlyNutrition(
  months: number,
): Promise<MonthlyNutrition[]> {
  "use server";
  try {
    const dailyData = await getNutritionForDays(months * 31);
    const monthlyData: Record<string, MonthlyNutrition> = {};

    dailyData.forEach((day) => {
      const date = new Date(day.date);
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      if (!monthlyData[key]) {
        monthlyData[key] = {
          month,
          year,
          avgCalories: 0,
          avgProtein: 0,
          avgFat: 0,
          avgCarbs: 0,
          totalCalories: 0,
          daysTracked: 0,
        };
      }

      monthlyData[key].totalCalories += day.calories;
      monthlyData[key].daysTracked += 1;
    });

    // Calculate averages
    const result = Object.values(monthlyData).map((month) => ({
      ...month,
      avgCalories: Math.round(month.totalCalories / month.daysTracked),
      avgProtein:
        Math.round((month.totalCalories / month.daysTracked / 4) * 10) / 10, // Rough estimate
      avgFat:
        Math.round((month.totalCalories / month.daysTracked / 9) * 10) / 10,
      avgCarbs:
        Math.round((month.totalCalories / month.daysTracked / 4) * 10) / 10,
    }));

    // Sort by year and month
    result.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    // Return last N months
    return result.slice(-months);
  } catch (error) {
    console.error("Failed to get monthly nutrition:", error);
    return [];
  }
}

/**
 * Get nutrition trends
 */
export async function getNutritionTrend(
  period: "week" | "month",
  count: number,
): Promise<NutritionTrend> {
  "use server";

  if (period === "week") {
    const data = await getWeeklyNutrition(count);
    return { period, data };
  } else {
    const data = await getMonthlyNutrition(count);
    return { period, data };
  }
}

/**
 * Get macros distribution (average percentages)
 */
export async function getMacrosDistribution(days: number = 7): Promise<{
  proteinPercent: number;
  fatPercent: number;
  carbsPercent: number;
}> {
  "use server";
  try {
    const dailyData = await getNutritionForDays(days);

    const totalProtein = dailyData.reduce((sum, day) => sum + day.protein, 0);
    const totalFat = dailyData.reduce((sum, day) => sum + day.fat, 0);
    const totalCarbs = dailyData.reduce((sum, day) => sum + day.carbs, 0);

    // Calculate calories from each macro
    const proteinCalories = totalProtein * 4;
    const fatCalories = totalFat * 9;
    const carbsCalories = totalCarbs * 4;

    const totalMacroCalories = proteinCalories + fatCalories + carbsCalories;

    if (totalMacroCalories === 0) {
      return { proteinPercent: 0, fatPercent: 0, carbsPercent: 0 };
    }

    return {
      proteinPercent: Math.round((proteinCalories / totalMacroCalories) * 100),
      fatPercent: Math.round((fatCalories / totalMacroCalories) * 100),
      carbsPercent: Math.round((carbsCalories / totalMacroCalories) * 100),
    };
  } catch (error) {
    console.error("Failed to get macros distribution:", error);
    return { proteinPercent: 0, fatPercent: 0, carbsPercent: 0 };
  }
}
