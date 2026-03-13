"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import {
  getSpendingByCategory,
  getIncomeVsExpensesOverTime,
  getMonthlyTotals,
} from "@/actions/transactions";
import {
  expenseCategories,
  type Category,
} from "@/features/finance/categories";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function FinanceAnalyticsPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "week" | "month" | "year"
  >("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [spendingByCategory, setSpendingByCategory] = useState<
    Array<{ categoryId: string; amount: number; percentage: number }>
  >([]);
  const [incomeVsExpenses, setIncomeVsExpenses] = useState<
    Array<{ date: string; income: number; expenses: number; balance: number }>
  >([]);
  const [monthlyTotals, setMonthlyTotals] = useState<
    Array<{ month: number; income: number; expenses: number; balance: number }>
  >([]);

  useEffect(() => {
    loadData();
  }, [selectedPeriod, selectedYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate: string;
      let endDate: string;

      if (selectedPeriod === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        startDate = weekAgo.toISOString();
        endDate = now.toISOString();
      } else if (selectedPeriod === "month") {
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
        ).toISOString();
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).toISOString();
      } else {
        startDate = new Date(selectedYear, 0, 1).toISOString();
        endDate = new Date(selectedYear, 11, 31).toISOString();
      }

      const [spending, incomeVsExp] = await Promise.all([
        getSpendingByCategory(startDate, endDate),
        getIncomeVsExpensesOverTime(startDate, endDate),
      ]);

      setSpendingByCategory(spending);
      setIncomeVsExpenses(incomeVsExp);

      // Load monthly data for year view
      if (selectedPeriod === "year") {
        const monthly = await getMonthlyTotals(selectedYear);
        setMonthlyTotals(monthly);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return expenseCategories.find((c) => c.id === categoryId);
  };

  const totalSpent = spendingByCategory.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const totalIncome = incomeVsExpenses.reduce(
    (sum, item) => sum + item.income,
    0,
  );
  const totalExpenses = incomeVsExpenses.reduce(
    (sum, item) => sum + item.expenses,
    0,
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("analytics.title")}</h1>
            <p className="text-muted-foreground">
              {t("analytics.description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedPeriod}
              onValueChange={(value) =>
                setSelectedPeriod(value as "week" | "month" | "year")
              }
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder={t("analytics.period")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">
                  {t("analytics.periods.week")}
                </SelectItem>
                <SelectItem value="month">
                  {t("analytics.periods.month")}
                </SelectItem>
                <SelectItem value="year">
                  {t("analytics.periods.year")}
                </SelectItem>
              </SelectContent>
            </Select>
            {selectedPeriod === "year" && (
              <Select
                value={String(selectedYear)}
                onValueChange={(value) => setSelectedYear(Number(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder={t("analytics.year")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium text-muted-foreground">
                {t("analytics.totalSpent")}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2">
              ${totalSpent.toFixed(2)}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div className="text-sm font-medium text-muted-foreground">
                {t("dashboard.summary.income")}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-green-600">
              +${totalIncome.toFixed(2)}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <div className="text-sm font-medium text-muted-foreground">
                {t("dashboard.summary.expenses")}
              </div>
            </div>
            <div className="text-2xl font-bold mt-2 text-red-600">
              -${totalExpenses.toFixed(2)}
            </div>
          </GlassCard>
        </div>

        {/* Spending by Category */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("analytics.spendingByCategory")}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : spendingByCategory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("analytics.noData")}
            </div>
          ) : (
            <div className="space-y-3">
              {spendingByCategory.map((item) => {
                const category = getCategoryById(item.categoryId);
                return (
                  <div key={item.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span>{category?.icon || "📝"}</span>
                        <span>
                          {category ? t(category.nameKey) : item.categoryId}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          ${item.amount.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all",
                          item.percentage >= 30
                            ? "bg-red-500"
                            : item.percentage >= 20
                              ? "bg-yellow-500"
                              : "bg-green-500",
                        )}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Income vs Expenses Over Time */}
        <GlassCard className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t("analytics.incomeVsExpenses")}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : incomeVsExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("analytics.noData")}
            </div>
          ) : (
            <div className="space-y-3">
              {incomeVsExpenses.slice(-14).map((item) => (
                <div key={item.date} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    <span
                      className={cn(
                        item.balance >= 0 ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {item.balance >= 0 ? "+" : ""}${item.balance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex gap-1 h-4">
                    <div
                      className="bg-green-500 rounded-l"
                      style={{
                        width: `${Math.min((item.income / Math.max(item.income, item.expenses)) * 50, 50)}%`,
                      }}
                    />
                    <div
                      className="bg-red-500 rounded-r"
                      style={{
                        width: `${Math.min((item.expenses / Math.max(item.income, item.expenses)) * 50, 50)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Monthly Overview (for year view) */}
        {selectedPeriod === "year" && (
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("analytics.monthlyOverview")} {selectedYear}
            </h2>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("common.loading")}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-4">
                {monthlyTotals.map((item) => (
                  <div
                    key={item.month}
                    className="p-3 rounded-lg bg-muted/50 space-y-1"
                  >
                    <div className="font-medium text-sm">
                      {MONTHS[item.month]}
                    </div>
                    <div className="text-xs text-green-600">
                      +${item.income.toFixed(0)}
                    </div>
                    <div className="text-xs text-red-600">
                      -${item.expenses.toFixed(0)}
                    </div>
                    <div
                      className={cn(
                        "text-xs font-medium",
                        item.balance >= 0 ? "text-blue-600" : "text-orange-600",
                      )}
                    >
                      =${item.balance.toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        )}
      </div>
    </AppLayout>
  );
}
