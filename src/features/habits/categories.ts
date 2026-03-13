// Habit Categories Configuration

import type {
  HabitCategory,
  HabitFrequency,
  HabitStatus,
  WeekDay,
} from "./types";

export interface HabitCategoryConfig {
  id: HabitCategory;
  nameKey: string;
  icon: string;
  color: string;
}

export interface HabitFrequencyConfig {
  id: HabitFrequency;
  nameKey: string;
  icon: string;
}

export interface HabitStatusConfig {
  id: HabitStatus;
  nameKey: string;
  icon: string;
  color: string;
}

export const habitCategories: HabitCategoryConfig[] = [
  {
    id: "health",
    nameKey: "habits.categories.health",
    icon: "❤️",
    color: "bg-red-500",
  },
  {
    id: "fitness",
    nameKey: "habits.categories.fitness",
    icon: "💪",
    color: "bg-orange-500",
  },
  {
    id: "nutrition",
    nameKey: "habits.categories.nutrition",
    icon: "🥗",
    color: "bg-green-500",
  },
  {
    id: "mindfulness",
    nameKey: "habits.categories.mindfulness",
    icon: "🧘",
    color: "bg-purple-500",
  },
  {
    id: "learning",
    nameKey: "habits.categories.learning",
    icon: "📚",
    color: "bg-blue-500",
  },
  {
    id: "productivity",
    nameKey: "habits.categories.productivity",
    icon: "⚡",
    color: "bg-yellow-500",
  },
  {
    id: "finance",
    nameKey: "habits.categories.finance",
    icon: "💰",
    color: "bg-emerald-500",
  },
  {
    id: "relationships",
    nameKey: "habits.categories.relationships",
    icon: "👨‍👩‍👧‍👦",
    color: "bg-pink-500",
  },
  {
    id: "creative",
    nameKey: "habits.categories.creative",
    icon: "🎨",
    color: "bg-violet-500",
  },
  {
    id: "other",
    nameKey: "habits.categories.other",
    icon: "📌",
    color: "bg-gray-500",
  },
];

export const habitFrequencies: HabitFrequencyConfig[] = [
  {
    id: "daily",
    nameKey: "habits.frequency.daily",
    icon: "📅",
  },
  {
    id: "weekly",
    nameKey: "habits.frequency.weekly",
    icon: "🗓️",
  },
  {
    id: "monthly",
    nameKey: "habits.frequency.monthly",
    icon: "📆",
  },
  {
    id: "specific_days",
    nameKey: "habits.frequency.specific_days",
    icon: "📋",
  },
];

export const habitStatuses: HabitStatusConfig[] = [
  {
    id: "active",
    nameKey: "habits.status.active",
    icon: "✅",
    color: "bg-green-500",
  },
  {
    id: "paused",
    nameKey: "habits.status.paused",
    icon: "⏸️",
    color: "bg-yellow-500",
  },
  {
    id: "completed",
    nameKey: "habits.status.completed",
    icon: "🏆",
    color: "bg-blue-500",
  },
  {
    id: "abandoned",
    nameKey: "habits.status.abandoned",
    icon: "❌",
    color: "bg-gray-500",
  },
];

export const weekDays: { id: WeekDay; nameKey: string; short: string }[] = [
  { id: "mon", nameKey: "habits.days.monday", short: "M" },
  { id: "tue", nameKey: "habits.days.tuesday", short: "T" },
  { id: "wed", nameKey: "habits.days.wednesday", short: "W" },
  { id: "thu", nameKey: "habits.days.thursday", short: "T" },
  { id: "fri", nameKey: "habits.days.friday", short: "F" },
  { id: "sat", nameKey: "habits.days.saturday", short: "S" },
  { id: "sun", nameKey: "habits.days.sunday", short: "S" },
];

export const getCategoryById = (
  id: HabitCategory,
): HabitCategoryConfig | undefined => {
  return habitCategories.find((cat) => cat.id === id);
};

export const getFrequencyById = (
  id: HabitFrequency,
): HabitFrequencyConfig | undefined => {
  return habitFrequencies.find((f) => f.id === id);
};

export const getStatusById = (
  id: HabitStatus,
): HabitStatusConfig | undefined => {
  return habitStatuses.find((s) => s.id === id);
};

export const getCategoryIcon = (id: HabitCategory): string => {
  return getCategoryById(id)?.icon || "📌";
};

export const getFrequencyIcon = (id: HabitFrequency): string => {
  return getFrequencyById(id)?.icon || "📅";
};

export const getStatusIcon = (id: HabitStatus): string => {
  return getStatusById(id)?.icon || "✅";
};

export const getCategoryColor = (id: HabitCategory): string => {
  return getCategoryById(id)?.color || "bg-gray-500";
};

export const getStatusColor = (id: HabitStatus): string => {
  return getStatusById(id)?.color || "bg-green-500";
};
