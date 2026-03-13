// Habits Module - Client-side hooks

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Habit,
  CreateHabitInput,
  UpdateHabitInput,
  HabitFilters,
  CompleteHabitInput,
} from "./types";
import {
  createHabit,
  updateHabit,
  deleteHabit,
  getHabits,
  getHabitById,
  completeHabit,
  uncompleteHabit,
  toggleHabitFavorite,
  pauseHabit,
  resumeHabit,
} from "./actions";

// Re-export types
export type { HabitFilters };

// Re-export utils
export {
  calculateHabitStats,
  getHabitsDueToday,
  getHabitsCompletedToday,
  getHabitsWithActiveStreak,
  getCompletionHistory,
} from "./utils";

/**
 * Hook for managing habits
 */
export function useHabits(filters?: HabitFilters) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHabits(filters);
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  return {
    habits,
    loading,
    error,
    refresh: loadHabits,
  };
}

/**
 * Hook for managing a single habit
 */
export function useHabit(id?: string) {
  const [habit, setHabit] = useState<Habit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHabit = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getHabitById(id);
      setHabit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load habit");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHabit();
  }, [loadHabit]);

  const update = async (input: UpdateHabitInput) => {
    const result = await updateHabit(input);
    if (result.success && result.data) {
      setHabit(result.data);
    }
    return result;
  };

  const remove = async () => {
    if (!id) return { success: false, error: "No habit ID" };
    const result = await deleteHabit(id);
    if (result.success) {
      setHabit(null);
    }
    return result;
  };

  const toggleFavorite = async () => {
    if (!id) return { success: false, error: "No habit ID" };
    const result = await toggleHabitFavorite(id);
    if (result.success && habit) {
      setHabit({ ...habit, isFavorite: result.isFavorite || false });
    }
    return result;
  };

  const complete = async (date: string, value?: number, note?: string) => {
    if (!id) return { success: false, error: "No habit ID" };
    const result = await completeHabit({ id, date, value, note });
    if (result.success && result.data) {
      setHabit(result.data);
    }
    return result;
  };

  const uncomplete = async (date: string) => {
    if (!id) return { success: false, error: "No habit ID" };
    const result = await uncompleteHabit(id, date);
    if (result.success && result.data) {
      setHabit(result.data);
    }
    return result;
  };

  const pause = async () => {
    if (!id) return { success: false, error: "No habit ID" };
    const result = await pauseHabit(id);
    return result;
  };

  const resume = async () => {
    if (!id) return { success: false, error: "No habit ID" };
    const result = await resumeHabit(id);
    return result;
  };

  return {
    habit,
    loading,
    error,
    refresh: loadHabit,
    update,
    remove,
    toggleFavorite,
    complete,
    uncomplete,
    pause,
    resume,
  };
}

/**
 * Hook for creating/editing habits
 */
export function useHabitForm(onSuccess?: () => void, initialData?: Habit) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: CreateHabitInput | UpdateHabitInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = initialData
        ? await updateHabit(data as UpdateHabitInput)
        : await createHabit(data as CreateHabitInput);

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
  createHabit,
  updateHabit,
  deleteHabit,
  getHabits,
  getHabitById,
  completeHabit,
  uncompleteHabit,
  toggleHabitFavorite,
  pauseHabit,
  resumeHabit,
};
