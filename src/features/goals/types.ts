// Goals Module Types

export type GoalCategory =
  | "finance"
  | "fitness"
  | "learning"
  | "career"
  | "health"
  | "relationships"
  | "personal"
  | "travel"
  | "creative"
  | "other";

export type GoalStatus = "active" | "completed" | "paused" | "abandoned";

export type GoalPriority = "low" | "medium" | "high" | "urgent";

export type GoalTimeframe = "short_term" | "medium_term" | "long_term";

export type MilestoneStatus = "pending" | "completed" | "skipped";

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: number;
  completedAt?: number;
  status: MilestoneStatus;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  status: GoalStatus;
  priority: GoalPriority;
  timeframe: GoalTimeframe;
  targetType: "number" | "currency" | "percentage" | "count" | "custom";
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: number;
  deadline?: number;
  completedAt?: number;
  progress: number; // 0-100
  milestones: Milestone[];
  linkedEntityId?: string; // ID from other modules (e.g., savings goal, reading goal)
  linkedModule?: "finance" | "nutrition" | "workouts" | "books";
  notes?: string;
  tags?: string[];
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateGoalInput {
  title: string;
  description?: string;
  category: GoalCategory;
  priority: GoalPriority;
  timeframe: GoalTimeframe;
  targetType: "number" | "currency" | "percentage" | "count" | "custom";
  targetValue: number;
  currentValue?: number;
  unit: string;
  startDate?: number;
  deadline?: number;
  milestones?: Array<{
    title: string;
    description?: string;
    targetValue: number;
    unit: string;
    deadline?: number;
    order: number;
  }>;
  linkedEntityId?: string;
  linkedModule?: "finance" | "nutrition" | "workouts" | "books";
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface UpdateGoalInput {
  id: string;
  title?: string;
  description?: string;
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
  timeframe?: GoalTimeframe;
  targetType?: "number" | "currency" | "percentage" | "count" | "custom";
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: number;
  completedAt?: number;
  notes?: string;
  tags?: string[];
  isFavorite?: boolean;
}

export interface UpdateGoalProgressInput {
  id: string;
  currentValue: number;
  note?: string;
}

export interface CreateMilestoneInput {
  goalId: string;
  title: string;
  description?: string;
  targetValue: number;
  unit: string;
  deadline?: number;
  order: number;
}

export interface UpdateMilestoneInput {
  id: string;
  title?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  status?: MilestoneStatus;
  completedAt?: number;
}

export interface GoalFilters {
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
  timeframe?: GoalTimeframe;
  search?: string;
  isFavorite?: boolean;
  hasDeadline?: boolean;
  tags?: string[];
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  completionRate: number;
  byCategory: Record<GoalCategory, number>;
  byPriority: Record<GoalPriority, number>;
  byStatus: Record<GoalStatus, number>;
  averageProgress: number;
  onTrackGoals: number;
  behindGoals: number;
  upcomingDeadlines: Goal[];
}

export interface GoalProgressHistory {
  date: number;
  value: number;
  note?: string;
}
