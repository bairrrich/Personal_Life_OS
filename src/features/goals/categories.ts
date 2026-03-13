// Goal Categories Configuration

import type {
  GoalCategory,
  GoalStatus,
  GoalPriority,
  GoalTimeframe,
} from "./types";

export interface GoalCategoryConfig {
  id: GoalCategory;
  nameKey: string;
  icon: string;
  color: string;
}

export interface GoalStatusConfig {
  id: GoalStatus;
  nameKey: string;
  icon: string;
  color: string;
}

export interface GoalPriorityConfig {
  id: GoalPriority;
  nameKey: string;
  icon: string;
  color: string;
}

export interface GoalTimeframeConfig {
  id: GoalTimeframe;
  nameKey: string;
  icon: string;
  color: string;
}

export const goalCategories: GoalCategoryConfig[] = [
  {
    id: "finance",
    nameKey: "goals.categories.finance",
    icon: "💰",
    color: "bg-green-500",
  },
  {
    id: "fitness",
    nameKey: "goals.categories.fitness",
    icon: "💪",
    color: "bg-red-500",
  },
  {
    id: "learning",
    nameKey: "goals.categories.learning",
    icon: "📚",
    color: "bg-blue-500",
  },
  {
    id: "career",
    nameKey: "goals.categories.career",
    icon: "💼",
    color: "bg-purple-500",
  },
  {
    id: "health",
    nameKey: "goals.categories.health",
    icon: "❤️",
    color: "bg-pink-500",
  },
  {
    id: "relationships",
    nameKey: "goals.categories.relationships",
    icon: "👨‍👩‍👧‍👦",
    color: "bg-orange-500",
  },
  {
    id: "personal",
    nameKey: "goals.categories.personal",
    icon: "🌱",
    color: "bg-emerald-500",
  },
  {
    id: "travel",
    nameKey: "goals.categories.travel",
    icon: "✈️",
    color: "bg-cyan-500",
  },
  {
    id: "creative",
    nameKey: "goals.categories.creative",
    icon: "🎨",
    color: "bg-violet-500",
  },
  {
    id: "other",
    nameKey: "goals.categories.other",
    icon: "📌",
    color: "bg-gray-500",
  },
];

export const goalStatuses: GoalStatusConfig[] = [
  {
    id: "active",
    nameKey: "goals.status.active",
    icon: "🎯",
    color: "bg-blue-500",
  },
  {
    id: "completed",
    nameKey: "goals.status.completed",
    icon: "✅",
    color: "bg-green-500",
  },
  {
    id: "paused",
    nameKey: "goals.status.paused",
    icon: "⏸️",
    color: "bg-yellow-500",
  },
  {
    id: "abandoned",
    nameKey: "goals.status.abandoned",
    icon: "❌",
    color: "bg-red-400",
  },
];

export const goalPriorities: GoalPriorityConfig[] = [
  {
    id: "low",
    nameKey: "goals.priority.low",
    icon: "🔽",
    color: "bg-gray-400",
  },
  {
    id: "medium",
    nameKey: "goals.priority.medium",
    icon: "➡️",
    color: "bg-yellow-500",
  },
  {
    id: "high",
    nameKey: "goals.priority.high",
    icon: "⬆️",
    color: "bg-orange-500",
  },
  {
    id: "urgent",
    nameKey: "goals.priority.urgent",
    icon: "🔥",
    color: "bg-red-600",
  },
];

export const goalTimeframes: GoalTimeframeConfig[] = [
  {
    id: "short_term",
    nameKey: "goals.timeframe.short_term",
    icon: "📅",
    color: "bg-green-400",
  },
  {
    id: "medium_term",
    nameKey: "goals.timeframe.medium_term",
    icon: "🗓️",
    color: "bg-blue-400",
  },
  {
    id: "long_term",
    nameKey: "goals.timeframe.long_term",
    icon: "📆",
    color: "bg-purple-400",
  },
];

export const getCategoryById = (
  id: GoalCategory,
): GoalCategoryConfig | undefined => {
  return goalCategories.find((cat) => cat.id === id);
};

export const getStatusById = (id: GoalStatus): GoalStatusConfig | undefined => {
  return goalStatuses.find((s) => s.id === id);
};

export const getPriorityById = (
  id: GoalPriority,
): GoalPriorityConfig | undefined => {
  return goalPriorities.find((p) => p.id === id);
};

export const getTimeframeById = (
  id: GoalTimeframe,
): GoalTimeframeConfig | undefined => {
  return goalTimeframes.find((t) => t.id === id);
};

export const getCategoryIcon = (id: GoalCategory): string => {
  return getCategoryById(id)?.icon || "📌";
};

export const getStatusIcon = (id: GoalStatus): string => {
  return getStatusById(id)?.icon || "🎯";
};

export const getPriorityIcon = (id: GoalPriority): string => {
  return getPriorityById(id)?.icon || "🔽";
};

export const getTimeframeIcon = (id: GoalTimeframe): string => {
  return getTimeframeById(id)?.icon || "📅";
};

export const getCategoryColor = (id: GoalCategory): string => {
  return getCategoryById(id)?.color || "bg-gray-500";
};

export const getStatusColor = (id: GoalStatus): string => {
  return getStatusById(id)?.color || "bg-blue-500";
};
