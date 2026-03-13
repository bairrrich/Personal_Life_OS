"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getWorkouts, type Workout } from "@/features/workouts";
import { Dumbbell, TrendingUp, Calendar } from "lucide-react";

export function WorkoutsSummaryWidget() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const allWorkouts = await getWorkouts();

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisWeek = allWorkouts.filter(
      (w) => new Date(w.date) >= startOfWeek,
    ).length;
    const thisMonth = allWorkouts.filter(
      (w) => new Date(w.date) >= startOfMonth,
    ).length;

    setRecentWorkouts(allWorkouts.slice(0, 5).sort((a, b) => b.date - a.date));
    setStats({
      total: allWorkouts.length,
      thisWeek,
      thisMonth,
    });
    setLoading(false);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {t("workouts.workouts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Dumbbell className="h-4 w-4" />
          {t("workouts.workouts")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold">{stats.thisWeek}</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{stats.thisMonth}</div>
            <div className="text-xs text-muted-foreground">This Month</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Recent Workouts */}
        {recentWorkouts.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Recent
            </div>
            {recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      workout.completed ? "bg-green-500" : "bg-gray-400"
                    }`}
                  />
                  <span className="truncate max-w-[150px]">{workout.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(workout.date)}
                </span>
              </div>
            ))}
          </div>
        )}

        {recentWorkouts.length === 0 && (
          <div className="text-center py-4">
            <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No workouts yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
