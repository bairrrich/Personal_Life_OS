// Meal Plan Utilities

import type { DayPlan } from "./types";

/**
 * Get the start of week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1);
  result.setDate(diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
  const weekStart = getWeekStart(date);
  const result = new Date(weekStart);
  result.setDate(weekStart.getDate() + 6);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Create default day plans for a week
 */
export function createDefaultDayPlans(weekStart: string): DayPlan[] {
  const startDate = new Date(weekStart);
  const days: DayPlan[] = [];
  const dayNames: Array<
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  > = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    days.push({
      day: dayNames[i],
      date: dateStr,
      breakfast: undefined,
      lunch: undefined,
      dinner: undefined,
      snacks: [],
      note: "",
    });
  }

  return days;
}
