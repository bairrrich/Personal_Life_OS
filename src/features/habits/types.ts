// Habits Module Types

export type HabitCategory =
  | "health"
  | "fitness"
  | "nutrition"
  | "mindfulness"
  | "learning"
  | "productivity"
  | "finance"
  | "relationships"
  | "creative"
  | "other";

export type HabitFrequency = "daily" | "weekly" | "monthly" | "specific_days"; // e.g., Mon, Wed, Fri

export type HabitStatus = "active" | "paused" | "completed" | "abandoned";

export type WeekDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface HabitCompletion {
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  completedAt?: number;
  note?: string;
  value?: number; // For habits with numeric tracking
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  status: HabitStatus;
  frequency: HabitFrequency;
  specificDays?: WeekDay[]; // For weekly frequency
  targetValue: number; // e.g., 8 glasses of water, 30 minutes
  currentValue: number;
  unit: string;
  streak: {
    current: number;
    longest: number;
    lastCompletedDate?: string;
  };
  completions: HabitCompletion[];
  startDate: number;
  endDate?: number;
  reminder?: {
    enabled: boolean;
    time?: string; // HH:MM format
  };
  notes?: string;
  tags?: string[];
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateHabitInput {
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  specificDays?: WeekDay[];
  targetValue: number;
  unit: string;
  startDate?: number;
  endDate?: number;
  reminder?: {
    enabled: boolean;
    time?: string;
  };
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface UpdateHabitInput {
  id: string;
  title?: string;
  description?: string;
  category?: HabitCategory;
  status?: HabitStatus;
  frequency?: HabitFrequency;
  specificDays?: WeekDay[];
  targetValue?: number;
  unit?: string;
  endDate?: number;
  reminder?: {
    enabled: boolean;
    time?: string;
  };
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface CompleteHabitInput {
  id: string;
  date: string; // ISO date string
  value?: number;
  note?: string;
}

export interface HabitFilters {
  category?: HabitCategory;
  status?: HabitStatus;
  frequency?: HabitFrequency;
  search?: string;
  isFavorite?: boolean;
  hasActiveStreak?: boolean;
  tags?: string[];
}

export interface HabitStats {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  totalCompletions: number;
  averageCompletionRate: number;
  byCategory: Record<HabitCategory, number>;
  byStatus: Record<HabitStatus, number>;
  byFrequency: Record<HabitFrequency, number>;
  totalStreakDays: number;
  longestStreak: {
    habitId: string;
    habitTitle: string;
    days: number;
  } | null;
  habitsWithActiveStreak: number;
}

export interface HabitCompletionHistory {
  date: string;
  completed: number;
  total: number;
  percentage: number;
}
