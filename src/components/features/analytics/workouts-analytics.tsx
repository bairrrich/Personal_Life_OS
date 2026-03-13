"use client";

import { AnalyticsCard } from "./analytics-card";
import { SimpleBarChart } from "./simple-bar-chart";
import { SimpleLineChart } from "./simple-line-chart";
import { SimplePieChart } from "./simple-pie-chart";
import { useWorkoutsAnalytics } from "@/features/analytics/client";
import {
  formatNumber,
  formatDuration,
  toPieChartData,
  generateColorPalette,
} from "@/features/analytics/utils";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Dumbbell, Timer, Trophy, Flame } from "lucide-react";
import type { AnalyticsFilters } from "@/features/analytics/types";

interface WorkoutsAnalyticsProps {
  filters?: AnalyticsFilters;
}

export function WorkoutsAnalyticsView({ filters }: WorkoutsAnalyticsProps) {
  const { data, loading, error } = useWorkoutsAnalytics(filters);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {error || "No data available"}
      </div>
    );
  }

  const colors = generateColorPalette(10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Workouts"
          value={formatNumber(data.totalWorkouts)}
          subtitle="All time"
          icon={<Dumbbell className="w-5 h-5" />}
          color="from-purple-500 to-purple-600"
        />
        <AnalyticsCard
          title="Total Duration"
          value={formatDuration(data.totalDuration)}
          subtitle="All time"
          icon={<Timer className="w-5 h-5" />}
          color="from-blue-500 to-blue-600"
        />
        <AnalyticsCard
          title="Avg Duration"
          value={formatDuration(data.averageDuration)}
          subtitle="Per workout"
          icon={<Timer className="w-5 h-5" />}
          color="from-cyan-500 to-cyan-600"
        />
        <AnalyticsCard
          title="Total Volume"
          value={formatNumber(data.totalVolume)}
          subtitle="kg lifted"
          icon={<Flame className="w-5 h-5" />}
          color="from-orange-500 to-orange-600"
        />
      </div>

      {/* Streak Cards */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{data.streak.current}</p>
              <p className="text-sm text-muted-foreground">Current Streak</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{data.streak.longest}</p>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Workout Frequency */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Weekly Frequency</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="text-3xl font-bold">{data.weeklyFrequency}</div>
            <p className="text-sm text-muted-foreground">workouts per week</p>
          </div>
          <SimpleBarChart
            data={data.timeSeries.map((d) => ({
              label: d.date,
              value: d.workouts,
            }))}
            height={100}
            color="oklch(65% 0.25 300)"
          />
        </div>
      </GlassCard>

      {/* Workout Volume Trend */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Trend</h3>
        <SimpleLineChart
          data={data.timeSeries.map((d) => ({
            label: d.date,
            value: d.volume,
          }))}
          height={200}
          color="oklch(65% 0.25 300)"
        />
      </GlassCard>

      {/* Workouts by Type */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Workouts by Type</h3>
        {data.workoutsByType.length > 0 ? (
          <SimplePieChart
            data={toPieChartData(
              data.workoutsByType.map((t) => ({
                name: t.type,
                value: t.count,
              })),
              colors,
            )}
            size={180}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No workout type data
          </p>
        )}
      </GlassCard>

      {/* Top Exercises */}
      {data.topExercises.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Exercises</h3>
          <div className="space-y-3">
            {data.topExercises.map((exercise, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium">{exercise.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {exercise.count} workouts
                  </p>
                </div>
                <span className="font-semibold text-purple-500">
                  {formatNumber(exercise.totalVolume)} kg
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
