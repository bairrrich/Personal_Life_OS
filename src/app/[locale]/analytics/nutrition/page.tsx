"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  MacrosPieChart,
} from "@/components/features/nutrition/nutrition-charts";
import {
  getNutritionForDays,
  getWeeklyNutrition,
  getMonthlyNutrition,
  getMacrosDistribution,
  type DailyNutrition,
  type WeeklyNutrition,
  type MonthlyNutrition,
} from "@/features/nutrition/analytics-actions";
import { Calendar, TrendingUp, PieChart, BarChart3 } from "lucide-react";

export default function NutritionAnalyticsPage() {
  const t = useTranslations();
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly">(
    "daily",
  );
  const [loading, setLoading] = useState(true);

  const [dailyData, setDailyData] = useState<DailyNutrition[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyNutrition[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyNutrition[]>([]);
  const [macrosDist, setMacrosDist] = useState({
    proteinPercent: 0,
    fatPercent: 0,
    carbsPercent: 0,
  });

  useEffect(() => {
    loadData();
  }, [timeRange]);

  const loadData = async () => {
    setLoading(true);
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

    const [daily, weekly, monthly, macros] = await Promise.all([
      getNutritionForDays(days),
      getWeeklyNutrition(Math.ceil(days / 7)),
      getMonthlyNutrition(Math.ceil(days / 30)),
      getMacrosDistribution(days),
    ]);

    setDailyData(daily);
    setWeeklyData(weekly);
    setMonthlyData(monthly);
    setMacrosDist(macros);
    setLoading(false);
  };

  const getDaysFromRange = () => {
    return timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  };

  const getChartData = () => {
    if (viewMode === "daily") {
      return dailyData.map((d) => ({
        label: new Date(d.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: d.calories,
        color:
          d.calories > 2500
            ? "#ef4444"
            : d.calories < 1500
              ? "#f59e0b"
              : "#22c55e",
      }));
    } else if (viewMode === "weekly") {
      return weeklyData.map((w) => ({
        label: `Week ${new Date(w.weekStart).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`,
        value: w.avgCalories,
        color: "#3b82f6",
      }));
    } else {
      return monthlyData.map((m) => ({
        label: new Date(m.year, m.month).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        value: m.avgCalories,
        color: "#8b5cf6",
      }));
    }
  };

  const getAverageCalories = () => {
    if (viewMode === "daily" && dailyData.length > 0) {
      const total = dailyData.reduce((sum, d) => sum + d.calories, 0);
      return Math.round(total / dailyData.length);
    } else if (viewMode === "weekly" && weeklyData.length > 0) {
      const total = weeklyData.reduce((sum, w) => sum + w.avgCalories, 0);
      return Math.round(total / weeklyData.length);
    } else if (viewMode === "monthly" && monthlyData.length > 0) {
      const total = monthlyData.reduce((sum, m) => sum + m.avgCalories, 0);
      return Math.round(total / monthlyData.length);
    }
    return 0;
  };

  const getAverageMacros = () => {
    const days = getDaysFromRange();
    if (viewMode === "daily" && dailyData.length > 0) {
      const protein =
        dailyData.reduce((sum, d) => sum + d.protein, 0) / dailyData.length;
      const fat =
        dailyData.reduce((sum, d) => sum + d.fat, 0) / dailyData.length;
      const carbs =
        dailyData.reduce((sum, d) => sum + d.carbs, 0) / dailyData.length;
      return {
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
        carbs: Math.round(carbs * 10) / 10,
      };
    }
    return { protein: 0, fat: 0, carbs: 0 };
  };

  const avgMacros = getAverageMacros();

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
            <p className="text-muted-foreground">Loading nutrition data...</p>
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
            <h1 className="text-3xl font-bold">Nutrition Analytics</h1>
            <p className="text-muted-foreground">
              Track your nutrition trends over time
            </p>
          </div>

          <div className="flex gap-2">
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v as any)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Calories
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getAverageCalories()}</div>
              <p className="text-xs text-muted-foreground">kcal/day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Protein</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {avgMacros.protein}g
              </div>
              <p className="text-xs text-muted-foreground">per day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Fat</CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {avgMacros.fat}g
              </div>
              <p className="text-xs text-muted-foreground">per day</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Carbs</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {avgMacros.carbs}g
              </div>
              <p className="text-xs text-muted-foreground">per day</p>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <LineChart
              title="Daily Calories Trend"
              data={dailyData.map((d) => ({
                label: new Date(d.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                value: d.calories,
              }))}
              height={250}
              color="#3b82f6"
            />

            <BarChart
              title="Daily Calories"
              data={dailyData.map((d) => ({
                label: new Date(d.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                value: d.calories,
                color:
                  d.calories > 2500
                    ? "#ef4444"
                    : d.calories < 1500
                      ? "#f59e0b"
                      : "#22c55e",
              }))}
              height={200}
            />
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <LineChart
              title="Weekly Average Calories"
              data={weeklyData.map((w) => ({
                label: `Week of ${new Date(w.weekStart).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                  },
                )}`,
                value: w.avgCalories,
              }))}
              height={250}
              color="#8b5cf6"
            />

            <BarChart
              title="Weekly Average Calories"
              data={weeklyData.map((w) => ({
                label: `W${new Date(w.weekStart).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}`,
                value: w.avgCalories,
                color: "#8b5cf6",
              }))}
              height={200}
            />
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <LineChart
              title="Monthly Average Calories"
              data={monthlyData.map((m) => ({
                label: new Date(m.year, m.month).toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                }),
                value: m.avgCalories,
              }))}
              height={250}
              color="#ec4899"
            />

            <BarChart
              title="Monthly Average Calories"
              data={monthlyData.map((m) => ({
                label: new Date(m.year, m.month).toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                }),
                value: m.avgCalories,
                color: "#ec4899",
              }))}
              height={200}
            />
          </TabsContent>
        </Tabs>

        {/* Macros Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          <MacrosPieChart
            title="Macros Distribution"
            protein={avgMacros.protein}
            fat={avgMacros.fat}
            carbs={avgMacros.carbs}
            size={250}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Macros Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Protein</span>
                  <span className="text-sm">{macrosDist.proteinPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${macrosDist.proteinPercent}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {avgMacros.protein}g/day ({avgMacros.protein * 4} kcal)
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Fat</span>
                  <span className="text-sm">{macrosDist.fatPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{ width: `${macrosDist.fatPercent}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {avgMacros.fat}g/day ({avgMacros.fat * 9} kcal)
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Carbs</span>
                  <span className="text-sm">{macrosDist.carbsPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${macrosDist.carbsPercent}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {avgMacros.carbs}g/day ({avgMacros.carbs * 4} kcal)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
