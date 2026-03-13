// Goals Module - Client-side hooks

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Goal,
  Milestone,
  CreateGoalInput,
  UpdateGoalInput,
  CreateMilestoneInput,
  UpdateMilestoneInput,
  GoalFilters,
  UpdateGoalProgressInput,
} from "./types";
import {
  createGoal,
  updateGoal,
  deleteGoal,
  getGoals,
  getGoalById,
  updateGoalProgress,
  toggleGoalFavorite,
  addMilestone,
  updateMilestone,
  deleteMilestone,
} from "./actions";

// Re-export types
export type { GoalFilters, Goal };

// Re-export utils
export { calculateGoalStats } from "./utils";

/**
 * Hook for managing goals
 */
export function useGoals(filters?: GoalFilters) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoals(filters);
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    goals,
    loading,
    error,
    refresh: loadGoals,
  };
}

/**
 * Hook for managing a single goal
 */
export function useGoal(id?: string) {
  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoal = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getGoalById(id);
      setGoal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goal");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  const update = async (input: UpdateGoalInput) => {
    const result = await updateGoal(input);
    if (result.success && result.data) {
      setGoal(result.data);
    }
    return result;
  };

  const remove = async () => {
    if (!id) return { success: false, error: "No goal ID" };
    const result = await deleteGoal(id);
    if (result.success) {
      setGoal(null);
    }
    return result;
  };

  const toggleFavorite = async () => {
    if (!id) return { success: false, error: "No goal ID" };
    const result = await toggleGoalFavorite(id);
    if (result.success && goal) {
      setGoal({ ...goal, isFavorite: result.isFavorite || false });
    }
    return result;
  };

  const updateProgress = async (currentValue: number) => {
    if (!id) return { success: false, error: "No goal ID" };
    const result = await updateGoalProgress({ id, currentValue });
    if (result.success && result.data) {
      setGoal(result.data);
    }
    return result;
  };

  return {
    goal,
    loading,
    error,
    refresh: loadGoal,
    update,
    remove,
    toggleFavorite,
    updateProgress,
  };
}

/**
 * Hook for managing milestones
 */
export function useMilestones(goalId?: string) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMilestones = useCallback(async () => {
    if (!goalId) {
      setMilestones([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const goal = await getGoalById(goalId);
      setMilestones(goal?.milestones || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load milestones",
      );
    } finally {
      setLoading(false);
    }
  }, [goalId]);

  useEffect(() => {
    loadMilestones();
  }, [loadMilestones]);

  const addMilestoneData = async (
    input: Omit<CreateMilestoneInput, "goalId">,
  ) => {
    if (!goalId) return { success: false, error: "No goal ID" };
    const result = await addMilestone({ ...input, goalId });
    if (result.success && result.data) {
      setMilestones((prev) => [...prev, result.data!]);
    }
    return result;
  };

  const updateMilestoneData = async (input: UpdateMilestoneInput) => {
    const result = await updateMilestone(input);
    if (result.success && result.data) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === input.id ? result.data! : m)),
      );
    }
    return result;
  };

  const removeMilestone = async (milestoneId: string) => {
    if (!goalId) return { success: false, error: "No goal ID" };
    const result = await deleteMilestone(goalId, milestoneId);
    if (result.success) {
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    }
    return result;
  };

  const completeMilestone = async (milestoneId: string) => {
    const milestone = milestones.find((m) => m.id === milestoneId);
    if (!milestone) return { success: false, error: "Milestone not found" };

    const result = await updateMilestone({
      id: milestoneId,
      status: "completed",
      currentValue: milestone.targetValue,
    });

    if (result.success && result.data) {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? result.data! : m)),
      );
    }
    return result;
  };

  return {
    milestones,
    loading,
    error,
    refresh: loadMilestones,
    addMilestone: addMilestoneData,
    updateMilestone: updateMilestoneData,
    removeMilestone,
    completeMilestone,
  };
}

/**
 * Hook for creating/editing goals
 */
export function useGoalForm(onSuccess?: () => void, initialData?: Goal) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: CreateGoalInput | UpdateGoalInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = initialData
        ? await updateGoal(data as UpdateGoalInput)
        : await createGoal(data as CreateGoalInput);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Operation failed");
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submit,
  };
}

// Re-export actions
export {
  createGoal,
  updateGoal,
  deleteGoal,
  getGoals,
  getGoalById,
  updateGoalProgress,
  toggleGoalFavorite,
  addMilestone,
  updateMilestone,
  deleteMilestone,
};
