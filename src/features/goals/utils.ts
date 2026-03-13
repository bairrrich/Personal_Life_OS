// Goals Module Utilities

import type { Goal, GoalStats, Milestone } from "./types";

/**
 * Calculate goal progress percentage
 */
export function calculateProgress(
  currentValue: number,
  targetValue: number,
): number {
  if (targetValue === 0) return 0;
  return Math.min(100, Math.round((currentValue / targetValue) * 100));
}

/**
 * Calculate milestone progress
 */
export function calculateMilestoneProgress(milestone: Milestone): number {
  return calculateProgress(milestone.currentValue, milestone.targetValue);
}

/**
 * Check if goal is on track based on deadline and progress
 */
export function isGoalOnTrack(goal: Goal): boolean {
  if (!goal.deadline) return true;
  if (goal.status === "completed") return true;

  const now = Date.now();
  const totalDuration = goal.deadline - goal.startDate;
  const elapsedDuration = now - goal.startDate;
  const expectedProgress = (elapsedDuration / totalDuration) * 100;

  return goal.progress >= expectedProgress * 0.8; // 80% of expected progress is acceptable
}

/**
 * Check if goal is behind schedule
 */
export function isGoalBehind(goal: Goal): boolean {
  return !isGoalOnTrack(goal) && goal.status === "active";
}

/**
 * Check if deadline is upcoming (within 7 days)
 */
export function hasUpcomingDeadline(goal: Goal, days = 7): boolean {
  if (!goal.deadline) return false;
  if (goal.status === "completed") return false;

  const now = Date.now();
  const daysUntilDeadline = (goal.deadline - now) / (1000 * 60 * 60 * 24);

  return daysUntilDeadline > 0 && daysUntilDeadline <= days;
}

/**
 * Check if goal is overdue
 */
export function isGoalOverdue(goal: Goal): boolean {
  if (!goal.deadline) return false;
  if (goal.status === "completed") return false;

  return Date.now() > goal.deadline;
}

/**
 * Calculate goal statistics
 */
export function calculateGoalStats(goals: Goal[]): GoalStats {
  const stats: GoalStats = {
    totalGoals: goals.length,
    activeGoals: 0,
    completedGoals: 0,
    completionRate: 0,
    byCategory: {
      finance: 0,
      fitness: 0,
      learning: 0,
      career: 0,
      health: 0,
      relationships: 0,
      personal: 0,
      travel: 0,
      creative: 0,
      other: 0,
    },
    byPriority: {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    },
    byStatus: {
      active: 0,
      completed: 0,
      paused: 0,
      abandoned: 0,
    },
    averageProgress: 0,
    onTrackGoals: 0,
    behindGoals: 0,
    upcomingDeadlines: [],
  };

  let totalProgress = 0;

  goals.forEach((goal) => {
    // Count by status
    stats.byStatus[goal.status]++;

    if (goal.status === "active") {
      stats.activeGoals++;
    } else if (goal.status === "completed") {
      stats.completedGoals++;
    }

    // Count by category
    stats.byCategory[goal.category]++;

    // Count by priority
    stats.byPriority[goal.priority]++;

    // Calculate average progress
    totalProgress += goal.progress;

    // Check if on track
    if (isGoalOnTrack(goal)) {
      stats.onTrackGoals++;
    } else if (goal.status === "active") {
      stats.behindGoals++;
    }

    // Check upcoming deadlines
    if (hasUpcomingDeadline(goal)) {
      stats.upcomingDeadlines.push(goal);
    }
  });

  // Calculate completion rate
  stats.completionRate =
    goals.length > 0
      ? Math.round((stats.completedGoals / goals.length) * 100)
      : 0;

  // Calculate average progress
  stats.averageProgress =
    goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;

  return stats;
}

/**
 * Get days remaining until deadline
 */
export function getDaysUntilDeadline(deadline?: number): number | null {
  if (!deadline) return null;
  return Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
}

/**
 * Get days since start date
 */
export function getDaysSinceStart(startDate: number): number {
  return Math.floor((Date.now() - startDate) / (1000 * 60 * 60 * 24));
}

/**
 * Format progress for display
 */
export function formatProgress(
  progress: number,
  currentValue: number,
  targetValue: number,
  unit: string,
): string {
  return `${currentValue} / ${targetValue} ${unit} (${progress}%)`;
}

/**
 * Sort goals by various criteria
 */
export function sortGoals(
  goals: Goal[],
  sortBy: "priority" | "deadline" | "progress" | "createdAt" | "title",
  sortOrder: "asc" | "desc" = "desc",
): Goal[] {
  const priorityOrder = { low: 0, medium: 1, high: 2, urgent: 3 };

  return [...goals].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "priority":
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case "deadline":
        comparison = (a.deadline || Infinity) - (b.deadline || Infinity);
        break;
      case "progress":
        comparison = a.progress - b.progress;
        break;
      case "createdAt":
        comparison = a.createdAt - b.createdAt;
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
}

/**
 * Filter goals by search query
 */
export function filterGoalsBySearch(goals: Goal[], query: string): Goal[] {
  if (!query.trim()) return goals;

  const searchQuery = query.toLowerCase().trim();

  return goals.filter(
    (goal) =>
      goal.title.toLowerCase().includes(searchQuery) ||
      goal.description?.toLowerCase().includes(searchQuery) ||
      goal.notes?.toLowerCase().includes(searchQuery) ||
      goal.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
  );
}

/**
 * Get next milestone order
 */
export function getNextMilestoneOrder(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  return Math.max(...milestones.map((m) => m.order)) + 1;
}

/**
 * Calculate estimated completion date based on current progress rate
 */
export function estimateCompletionDate(goal: Goal): number | null {
  if (goal.progress === 0 || goal.progress >= 100) return null;

  const daysElapsed = getDaysSinceStart(goal.startDate);
  if (daysElapsed === 0) return null;

  const progressPerDay = goal.progress / daysElapsed;
  const remainingProgress = 100 - goal.progress;
  const daysRemaining = remainingProgress / progressPerDay;

  return Date.now() + daysRemaining * 24 * 60 * 60 * 1000;
}

/**
 * Get streak for consecutive days of progress updates
 */
export function getProgressStreak(
  progressHistory: Array<{ date: number }>,
): number {
  if (progressHistory.length === 0) return 0;

  const sorted = [...progressHistory].sort((a, b) => b.date - a.date);
  let streak = 1;
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;

  // Check if there's progress today or yesterday
  const latestProgress = sorted[0].date;
  if (latestProgress < yesterday) return 0;

  for (let i = 1; i < sorted.length; i++) {
    const currentDate = sorted[i - 1].date;
    const prevDate = sorted[i].date;
    const diffDays = Math.round(
      (currentDate - prevDate) / (24 * 60 * 60 * 1000),
    );

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}
