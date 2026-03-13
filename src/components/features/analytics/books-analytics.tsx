"use client";

import { AnalyticsCard } from "./analytics-card";
import { SimpleBarChart } from "./simple-bar-chart";
import { SimpleLineChart } from "./simple-line-chart";
import { SimplePieChart } from "./simple-pie-chart";
import { useBooksAnalytics } from "@/features/analytics/client";
import {
  formatNumber,
  toPieChartData,
  generateColorPalette,
} from "@/features/analytics/utils";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { BookOpen, Star, Target, TrendingUp } from "lucide-react";
import type { AnalyticsFilters } from "@/features/analytics/types";

interface BooksAnalyticsProps {
  filters?: AnalyticsFilters;
}

export function BooksAnalyticsView({ filters }: BooksAnalyticsProps) {
  const { data, loading, error } = useBooksAnalytics(filters);

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
          title="Total Books"
          value={formatNumber(data.totalBooks)}
          subtitle="In library"
          icon={<BookOpen className="w-5 h-5" />}
          color="from-indigo-500 to-indigo-600"
        />
        <AnalyticsCard
          title="Books Read"
          value={formatNumber(data.booksRead)}
          subtitle="Completed"
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-green-500 to-green-600"
        />
        <AnalyticsCard
          title="Avg Rating"
          value={data.averageRating > 0 ? data.averageRating.toFixed(1) : "-"}
          subtitle="Out of 5"
          icon={<Star className="w-5 h-5" />}
          color="from-yellow-500 to-yellow-600"
        />
        <AnalyticsCard
          title="Pages Read"
          value={formatNumber(data.totalPagesRead)}
          subtitle="Total"
          icon={<BookOpen className="w-5 h-5" />}
          color="from-blue-500 to-blue-600"
        />
      </div>

      {/* Reading Goal Progress */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">
              Reading Goal {new Date().getFullYear()}
            </h3>
            <p className="text-sm text-muted-foreground">
              {data.readingGoalProgress.completed} of{" "}
              {data.readingGoalProgress.target} books
            </p>
          </div>
        </div>
        <div className="h-4 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              data.readingGoalProgress.onTrack
                ? "bg-green-500"
                : "bg-yellow-500"
            }`}
            style={{
              width: `${Math.min(100, data.readingGoalProgress.percentage)}%`,
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground">
            {data.readingGoalProgress.percentage}% complete
          </p>
          <p
            className={`text-sm font-medium ${
              data.readingGoalProgress.onTrack
                ? "text-green-500"
                : "text-yellow-500"
            }`}
          >
            {data.readingGoalProgress.onTrack ? "On track!" : "Behind schedule"}
          </p>
        </div>
      </GlassCard>

      {/* Books Read Trend */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Books Completed Over Time
        </h3>
        <SimpleLineChart
          data={data.timeSeries.map((d) => ({
            label: d.date,
            value: d.booksCompleted,
          }))}
          height={200}
          color="oklch(65% 0.25 260)"
        />
      </GlassCard>

      {/* Books by Genre */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Books by Genre</h3>
        {data.booksByGenre.length > 0 ? (
          <SimplePieChart
            data={toPieChartData(
              data.booksByGenre.slice(0, 6).map((g) => ({
                name: g.genre.replace("_", " "),
                value: g.count,
              })),
              colors,
            )}
            size={180}
            showLabels={true}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No genre data
          </p>
        )}
      </GlassCard>

      {/* Books by Format */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Books by Format</h3>
        {data.booksByFormat.length > 0 ? (
          <SimplePieChart
            data={toPieChartData(
              data.booksByFormat.map((f) => ({
                name: f.format,
                value: f.count,
              })),
              colors,
            )}
            size={180}
            showLabels={true}
          />
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No format data
          </p>
        )}
      </GlassCard>

      {/* Books by Status */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Books by Status</h3>
        <div className="grid grid-cols-3 gap-4">
          {data.booksByStatus.map((status, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold">{status.count}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {status.status.replace("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Top Authors */}
      {data.topAuthors.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Authors</h3>
          <div className="space-y-3">
            {data.topAuthors.slice(0, 5).map((author, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium">{author.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {author.booksRead} books read
                  </p>
                </div>
                {author.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-semibold">
                      {author.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
