"use client";

import { useTranslations } from "next-intl";
import { AnalyticsCard } from "./analytics-card";
import { SimpleLineChart } from "./simple-line-chart";
import { SimpleBarChart } from "./simple-bar-chart";
import { SimplePieChart } from "./simple-pie-chart";
import { useFinanceAnalytics } from "@/features/analytics/client";
import {
  formatCurrency,
  formatPercentage,
  toPieChartData,
  generateColorPalette,
} from "@/features/analytics/utils";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { AnalyticsFilters } from "@/features/analytics/types";

interface FinanceAnalyticsProps {
  filters?: AnalyticsFilters;
}

export function FinanceAnalyticsView({ filters }: FinanceAnalyticsProps) {
  const t = useTranslations();
  const { data, loading, error } = useFinanceAnalytics(filters);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Total Income"
          value={formatCurrency(data.totalIncome)}
          subtitle="All time"
          icon={<TrendingUp className="w-5 h-5" />}
          color="from-green-500 to-green-600"
        />
        <AnalyticsCard
          title="Total Expenses"
          value={formatCurrency(data.totalExpenses)}
          subtitle="All time"
          icon={<TrendingDown className="w-5 h-5" />}
          color="from-red-500 to-red-600"
        />
        <AnalyticsCard
          title="Net Balance"
          value={formatCurrency(data.netBalance)}
          subtitle={data.netBalance >= 0 ? "Positive" : "Negative"}
          icon={<Wallet className="w-5 h-5" />}
          color={
            data.netBalance >= 0
              ? "from-blue-500 to-blue-600"
              : "from-orange-500 to-orange-600"
          }
        />
        <AnalyticsCard
          title="Savings Rate"
          value={formatPercentage(data.savingsRate)}
          subtitle="Of income"
          icon={<DollarSign className="w-5 h-5" />}
          color="from-emerald-500 to-emerald-600"
        />
      </div>

      {/* Time Series Chart */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Income vs Expenses Over Time
        </h3>
        <SimpleLineChart
          data={data.timeSeries.map((d) => ({
            label: d.date,
            value: d.income - d.expenses,
          }))}
          height={200}
          color="oklch(65% 0.25 260)"
        />
      </GlassCard>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
          {data.expensesByCategory.length > 0 ? (
            <SimplePieChart
              data={toPieChartData(
                data.expensesByCategory.map((c) => ({
                  name: c.categoryName,
                  value: c.amount,
                  color: c.color,
                  icon: c.icon,
                })),
                colors,
              )}
              size={180}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No expense data
            </p>
          )}
        </GlassCard>

        {/* Income by Category */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Income by Category</h3>
          {data.incomeByCategory.length > 0 ? (
            <SimplePieChart
              data={toPieChartData(
                data.incomeByCategory.map((c) => ({
                  name: c.categoryName,
                  value: c.amount,
                  color: c.color,
                  icon: c.icon,
                })),
                colors,
              )}
              size={180}
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No income data
            </p>
          )}
        </GlassCard>
      </div>

      {/* Top Expenses */}
      {data.topExpenses.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Expenses</h3>
          <div className="space-y-3">
            {data.topExpenses.map((expense, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium">{expense.description}</p>
                  {expense.category && (
                    <p className="text-xs text-muted-foreground">
                      {expense.category}
                    </p>
                  )}
                </div>
                <span className="font-semibold text-red-500">
                  {formatCurrency(expense.amount)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Budget Progress */}
      {data.budgetProgress.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Budget Progress</h3>
          <div className="space-y-4">
            {data.budgetProgress.map((budget, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {budget.categoryName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(budget.spent)} /{" "}
                    {formatCurrency(budget.budget)}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all",
                      budget.percentage > 100
                        ? "bg-red-500"
                        : budget.percentage > 80
                          ? "bg-yellow-500"
                          : "bg-green-500",
                    )}
                    style={{ width: `${Math.min(100, budget.percentage)}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  {formatPercentage(budget.percentage)}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
