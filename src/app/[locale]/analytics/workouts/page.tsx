"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  BarChart,
  MacrosPieChart,
} from "@/components/features/nutrition/nutrition-charts";
import { getWorkouts, getExercises, type Workout } from "@/features/workouts";
import { Dumbbell, TrendingUp, Calendar, Award } from "lucide-react";

export default function WorkoutsAnalyticsPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("90d");

  useEffect(() => {
    loadWorkouts();
  }, [timeRange]);

  const loadWorkouts = async () => {
    const allWorkouts = await getWorkouts();

    const now = new Date();
    let startDate = new Date(0);

    if (timeRange === "30d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
    } else if (timeRange === "90d") {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 90);
    }

    const filtered = allWorkouts.filter((w) => new Date(w.date) >= startDate);
    setWorkouts(filtered.sort((a, b) => a.date - b.date));
    setLoading(false);
  };

  // Calculate stats
  const totalWorkouts = workouts.length;
  const completedWorkouts = workouts.filter((w) => w.completed).length;
  const totalVolume = workouts.reduce((sum, w) => {
    return (
      sum +
      w.exercises.reduce((exSum, ex) => {
        return (
          exSum +
          ex.sets.reduce((setSum, set) => {
            return setSum + set.weight * set.reps;
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const avgDuration =
    workouts.length > 0
      ? Math.round(
          workouts.reduce((sum, w) => sum + (w.duration || 0), 0) /
            workouts.length,
        )
      : 0;

  // Workout frequency by week
  const workoutsByWeek = workouts.reduce(
    (acc, workout) => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      acc[weekKey] = (acc[weekKey] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Muscle group distribution
  const muscleGroupCount = workouts.reduce(
    (acc, workout) => {
      workout.exercises.forEach((ex) => {
        // Would need exercise data to get muscle groups
        // For now, just count exercises
        acc.total = (acc.total || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  // Chart data
  const frequencyData = Object.entries(workoutsByWeek)
    .slice(-12)
    .map(([week, count]) => ({
      label: new Date(week).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      value: count,
    }));

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Workout Analytics</h1>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold">Workout Analytics</h1>
            <p className="text-muted-foreground">
              Track your training progress
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workouts
              </CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground">
                {completedWorkouts} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalWorkouts > 0
                  ? Math.round((completedWorkouts / totalWorkouts) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">
                Workouts completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Duration
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgDuration}</div>
              <p className="text-xs text-muted-foreground">minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Volume
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(totalVolume / 1000).toFixed(1)}k
              </div>
              <p className="text-xs text-muted-foreground">kg lifted</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Workout Frequency */}
          <BarChart
            title="Workout Frequency (per week)"
            data={frequencyData}
            height={200}
          />

          {/* Workout Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workout Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(
                  workouts.reduce(
                    (acc, w) => {
                      acc[w.type] = (acc[w.type] || 0) + 1;
                      return acc;
                    },
                    {} as Record<string, number>,
                  ),
                ).map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(count / totalWorkouts) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Workouts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {workouts.length > 0 ? (
              <div className="space-y-2">
                {workouts
                  .slice(-10)
                  .reverse()
                  .map((workout) => (
                    <div
                      key={workout.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            workout.completed ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                        <div>
                          <div className="font-medium">{workout.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(workout.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                            {workout.duration && ` • ${workout.duration} min`}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {workout.exercises.length} exercises
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No workouts in this period
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
