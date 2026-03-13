// Habits Module Utilities

import type {
  Habit,
  HabitStats,
  HabitCompletion,
  HabitCompletionHistory,
  WeekDay,
} from "./types";

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Get date string from timestamp
 */
export function getDateFromTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString().split("T")[0];
}

/**
 * Check if habit should be completed on a specific day
 */
export function shouldCompleteToday(
  habit: Habit,
  date: Date = new Date(),
): boolean {
  if (habit.status !== "active") return false;

  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dayMap: Record<number, string> = {
    0: "sun",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
  };
  const todayKey = dayMap[dayOfWeek];

  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekly":
      return habit.specificDays?.includes(todayKey as WeekDay) ?? false;
    case "monthly":
      // Complete on the same day of month as start date
      const startDate = new Date(habit.startDate);
      return date.getDate() === startDate.getDate();
    default:
      return true;
  }
}

/**
 * Check if habit was completed on a specific date
 */
export function isCompletedOnDate(habit: Habit, date: string): boolean {
  return habit.completions.some((c) => c.date === date && c.completed);
}

/**
 * Check if habit is completed today
 */
export function isCompletedToday(habit: Habit): boolean {
  return isCompletedOnDate(habit, getTodayString());
}

/**
 * Calculate current streak for a habit
 */
export function calculateStreak(completions: HabitCompletion[]): {
  current: number;
  longest: number;
  lastCompletedDate?: string;
} {
  if (completions.length === 0) {
    return { current: 0, longest: 0 };
  }

  const completedDates = completions
    .filter((c) => c.completed)
    .map((c) => c.date)
    .sort((a, b) => b.localeCompare(a));

  if (completedDates.length === 0) {
    return { current: 0, longest: 0 };
  }

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < completedDates.length; i++) {
    const currentDate = new Date(completedDates[i - 1]);
    const prevDate = new Date(completedDates[i]);
    const diffDays = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      tempStreak++;
      currentStreak = tempStreak;
    } else if (diffDays === 0) {
      // Same day, skip
      continue;
    } else {
      // Check if the most recent completion was today or yesterday for current streak
      const today = new Date(getTodayString());
      const mostRecent = new Date(completedDates[0]);
      const daysSinceLastCompletion = Math.round(
        (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceLastCompletion > 1) {
        currentStreak = 0;
      }

      tempStreak = 1;
    }

    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Check if streak is still active
  const today = new Date(getTodayString());
  const mostRecent = new Date(completedDates[0]);
  const daysSinceLastCompletion = Math.round(
    (today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceLastCompletion > 1) {
    currentStreak = 0;
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    lastCompletedDate: completedDates[0],
  };
}

/**
 * Calculate habit statistics
 */
export function calculateHabitStats(habits: Habit[]): HabitStats {
  const stats: HabitStats = {
    totalHabits: habits.length,
    activeHabits: 0,
    completedToday: 0,
    totalCompletions: 0,
    averageCompletionRate: 0,
    byCategory: {
      health: 0,
      fitness: 0,
      nutrition: 0,
      mindfulness: 0,
      learning: 0,
      productivity: 0,
      finance: 0,
      relationships: 0,
      creative: 0,
      other: 0,
    },
    byStatus: {
      active: 0,
      paused: 0,
      completed: 0,
      abandoned: 0,
    },
    byFrequency: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      specific_days: 0,
    },
    totalStreakDays: 0,
    longestStreak: null,
    habitsWithActiveStreak: 0,
  };

  let totalCompletionRate = 0;
  let habitsWithHistory = 0;

  const today = getTodayString();

  habits.forEach((habit) => {
    // Count by status
    stats.byStatus[habit.status]++;

    if (habit.status === "active") {
      stats.activeHabits++;
    }

    // Count by category
    stats.byCategory[habit.category]++;

    // Count by frequency
    stats.byFrequency[habit.frequency]++;

    // Count completions
    const completedCount = habit.completions.filter((c) => c.completed).length;
    stats.totalCompletions += completedCount;

    // Check if completed today
    if (habit.completions.some((c) => c.date === today && c.completed)) {
      stats.completedToday++;
    }

    // Calculate streak
    const streak = calculateStreak(habit.completions);
    stats.totalStreakDays += streak.current;

    if (streak.current > 0) {
      stats.habitsWithActiveStreak++;
    }

    // Track longest streak
    if (!stats.longestStreak || streak.longest > stats.longestStreak.days) {
      stats.longestStreak = {
        habitId: habit.id,
        habitTitle: habit.title,
        days: streak.longest,
      };
    }

    // Calculate completion rate
    if (habit.completions.length > 0) {
      const rate = (completedCount / habit.completions.length) * 100;
      totalCompletionRate += rate;
      habitsWithHistory++;
    }
  });

  // Calculate average completion rate
  stats.averageCompletionRate =
    habitsWithHistory > 0
      ? Math.round(totalCompletionRate / habitsWithHistory)
      : 0;

  return stats;
}

/**
 * Get completion history for chart
 */
export function getCompletionHistory(
  habits: Habit[],
  days: number = 30,
): HabitCompletionHistory[] {
  const history: HabitCompletionHistory[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const completed = habits.filter((h) =>
      h.completions.some((c) => c.date === dateStr && c.completed),
    ).length;

    // Only count habits that should be completed on this day
    const total = habits.filter((h) => shouldCompleteToday(h, date)).length;

    history.push({
      date: dateStr,
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  }

  return history;
}

/**
 * Get habits due today
 */
export function getHabitsDueToday(habits: Habit[]): Habit[] {
  return habits.filter((h) => h.status === "active" && shouldCompleteToday(h));
}

/**
 * Get habits completed today
 */
export function getHabitsCompletedToday(habits: Habit[]): Habit[] {
  return habits.filter((h) => isCompletedToday(h));
}

/**
 * Get habits with active streaks
 */
export function getHabitsWithActiveStreak(habits: Habit[]): Habit[] {
  return habits.filter((h) => {
    const streak = calculateStreak(h.completions);
    return streak.current > 0;
  });
}

/**
 * Format streak for display
 */
export function formatStreak(days: number): string {
  if (days === 0) return "No streak";
  if (days === 1) return "1 day";
  if (days < 7) return `${days} days`;
  if (days < 30) return `${Math.floor(days / 7)} weeks`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

/**
 * Get motivation message based on streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your streak!";
  if (streak === 1) return "Keep it up!";
  if (streak < 7) return "Great start!";
  if (streak < 30) return "On fire! 🔥";
  if (streak < 100) return "Unstoppable! 🚀";
  return "Legendary! 👑";
}
