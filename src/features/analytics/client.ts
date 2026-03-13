// Analytics Module - Client-side hooks

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  FinanceAnalytics,
  NutritionAnalytics,
  WorkoutsAnalytics,
  BooksAnalytics,
  AnalyticsFilters,
} from "./types";
import {
  getFinanceAnalytics,
  getNutritionAnalytics,
  getWorkoutsAnalytics,
  getBooksAnalytics,
} from "./actions";

// Re-export types
export type { AnalyticsFilters };

/**
 * Hook for finance analytics
 */
export function useFinanceAnalytics(filters?: AnalyticsFilters) {
  const [data, setData] = useState<FinanceAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getFinanceAnalytics(filters);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load finance analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}

/**
 * Hook for nutrition analytics
 */
export function useNutritionAnalytics(filters?: AnalyticsFilters) {
  const [data, setData] = useState<NutritionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNutritionAnalytics(filters);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load nutrition analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}

/**
 * Hook for workouts analytics
 */
export function useWorkoutsAnalytics(filters?: AnalyticsFilters) {
  const [data, setData] = useState<WorkoutsAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getWorkoutsAnalytics(filters);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load workouts analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}

/**
 * Hook for books analytics
 */
export function useBooksAnalytics(filters?: AnalyticsFilters) {
  const [data, setData] = useState<BooksAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBooksAnalytics(filters);
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load books analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    refresh: loadData,
  };
}

// Re-export actions
export {
  getFinanceAnalytics,
  getNutritionAnalytics,
  getWorkoutsAnalytics,
  getBooksAnalytics,
};
