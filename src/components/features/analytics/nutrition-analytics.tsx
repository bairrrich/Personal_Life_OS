"use client";

import { AnalyticsCard } from "./analytics-card";
import { SimpleLineChart } from "./simple-line-chart";
import { SimplePieChart } from "./simple-pie-chart";
import { useNutritionAnalytics } from "@/features/analytics/client";
import {
  formatNumber,
  toPieChartData,
  generateColorPalette,
} from "@/features/analytics/utils";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Flame, Droplets, TrendingUp } from "lucide-react";
import type { AnalyticsFilters } from "@/features/analytics/types";

interface NutritionAnalyticsProps {
  filters?: AnalyticsFilters;
}

export function NutritionAnalyticsView({ filters }: NutritionAnalyticsProps) {
  const { data, loading, error } = useNutritionAnalytics(filters);

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

  const colors = [
    "oklch(65% 0.25 30)",
    "oklch(65% 0.25 260)",
    "oklch(70% 0.2 140)",
    "oklch(75% 0.15 60)",
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Avg Calories"
          value={formatNumber(data.averageCalories)}
          subtitle="kcal/day"
          icon={<Flame className="w-5 h-5" />}
          color="from-orange-500 to-orange-600"
        />
        <AnalyticsCard
          title="Avg Protein"
          value={`${data.averageProtein}g`}
          subtitle="per day"
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-blue-500 to-blue-600"
        />
        <AnalyticsCard
          title="Avg Fat"
          value={`${data.averageFat}g`}
          subtitle="per day"
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-yellow-500 to-yellow-600"
        />
        <AnalyticsCard
          title="Avg Carbs"
          value={`${data.averageCarbs}g`}
          subtitle="per day"
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-green-500 to-green-600"
        />
      </div>

      {/* Water Intake */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Droplets className="w-6 h-6 text-blue-500" />
          <div>
            <h3 className="text-lg font-semibold">Water Intake</h3>
            <p className="text-sm text-muted-foreground">
              Average {formatNumber(data.averageWater)}ml per day
            </p>
          </div>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{
              width: `${Math.min(100, (data.averageWater / 2000) * 100)}%`,
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-right">
          Goal: 2000ml
        </p>
      </GlassCard>

      {/* Macro Distribution */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Macro Distribution</h3>
        <div className="flex items-center justify-center">
          <SimplePieChart
            data={toPieChartData(
              [
                {
                  name: "Protein",
                  value: data.macroDistribution.proteinPercentage,
                  color: colors[1],
                },
                {
                  name: "Fat",
                  value: data.macroDistribution.fatPercentage,
                  color: colors[0],
                },
                {
                  name: "Carbs",
                  value: data.macroDistribution.carbsPercentage,
                  color: colors[2],
                },
              ],
              colors,
            )}
            size={200}
          />
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-500">
              {data.macroDistribution.proteinPercentage}%
            </p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-500">
              {data.macroDistribution.fatPercentage}%
            </p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {data.macroDistribution.carbsPercentage}%
            </p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
        </div>
      </GlassCard>

      {/* Calorie Trend */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Calorie Trend</h3>
        <SimpleLineChart
          data={data.timeSeries.map((d) => ({
            label: d.date,
            value: d.calories,
          }))}
          height={200}
          color="oklch(65% 0.25 30)"
        />
      </GlassCard>

      {/* Daily Compliance */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Calorie Compliance</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${data.dailyCompliance}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold">{data.dailyCompliance}%</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Days within ±10% of calorie goal
        </p>
      </GlassCard>

      {/* Meal Frequency */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Meal Frequency</h3>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(data.mealFrequency).map(([type, count]) => (
            <div key={type} className="text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground capitalize">{type}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
