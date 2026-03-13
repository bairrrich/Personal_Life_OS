// Analytics Module Utilities

import type {
  ChartDataPoint,
  PieChartData,
  LineChartData,
  BarChartData,
} from "./types";

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Format date for charts
 */
export function formatDateForChart(date: string, period: string): string {
  const d = new Date(date);

  if (period === "week") {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  if (period === "year") {
    return d.toLocaleDateString("en-US", { month: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Calculate trend (positive/negative percentage change)
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get trend color class
 */
export function getTrendColor(trend: number, inverse = false): string {
  const isPositive = trend >= 0;
  const isGood = inverse ? !isPositive : isPositive;

  return isGood ? "text-green-500" : "text-red-500";
}

/**
 * Convert data to pie chart format
 */
export function toPieChartData(
  data: Array<{ name: string; value: number; color?: string; icon?: string }>,
  colors: string[],
): PieChartData[] {
  return data.map((item, index) => ({
    name: item.name,
    value: item.value,
    color: item.color || colors[index % colors.length],
    icon: item.icon,
  }));
}

/**
 * Convert data to line chart format
 */
export function toLineChartData(
  data: ChartDataPoint[],
  name: string,
  color: string,
): LineChartData {
  return {
    name,
    data,
    color,
  };
}

/**
 * Convert data to bar chart format
 */
export function toBarChartData(
  data: ChartDataPoint[],
  name: string,
  color: string,
): BarChartData {
  return {
    name,
    data,
    color,
  };
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: number[],
  window: number,
): number[] {
  const result: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    result.push(avg);
  }

  return result;
}

/**
 * Find max value in data array
 */
export function findMax(
  data: ChartDataPoint[],
  valueKey: string = "value",
): number {
  return Math.max(
    ...data.map((d) => (d[valueKey as keyof ChartDataPoint] as number) || 0),
  );
}

/**
 * Find min value in data array
 */
export function findMin(
  data: ChartDataPoint[],
  valueKey: string = "value",
): number {
  return Math.min(
    ...data.map((d) => (d[valueKey as keyof ChartDataPoint] as number) || 0),
  );
}

/**
 * Calculate sum of values
 */
export function calculateSum(
  data: ChartDataPoint[],
  valueKey: string = "value",
): number {
  return data.reduce(
    (sum, d) => sum + ((d[valueKey as keyof ChartDataPoint] as number) || 0),
    0,
  );
}

/**
 * Calculate average of values
 */
export function calculateAverage(
  data: ChartDataPoint[],
  valueKey: string = "value",
): number {
  if (data.length === 0) return 0;
  return calculateSum(data, valueKey) / data.length;
}

/**
 * Generate color palette
 */
export function generateColorPalette(count: number): string[] {
  const colors = [
    "oklch(65% 0.25 0)", // Red
    "oklch(70% 0.2 140)", // Green
    "oklch(65% 0.25 260)", // Blue
    "oklch(75% 0.15 60)", // Yellow
    "oklch(65% 0.25 300)", // Purple
    "oklch(70% 0.2 180)", // Cyan
    "oklch(65% 0.25 30)", // Orange
    "oklch(60% 0.2 330)", // Pink
    "oklch(70% 0.15 100)", // Lime
    "oklch(65% 0.2 200)", // Sky
  ];

  return colors.slice(0, count);
}

/**
 * Get status color for analytics cards
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    income: "text-green-500 bg-green-500/10",
    expense: "text-red-500 bg-red-500/10",
    balance: "text-blue-500 bg-blue-500/10",
    calories: "text-orange-500 bg-orange-500/10",
    protein: "text-blue-500 bg-blue-500/10",
    fat: "text-yellow-500 bg-yellow-500/10",
    carbs: "text-green-500 bg-green-500/10",
    workouts: "text-purple-500 bg-purple-500/10",
    books: "text-indigo-500 bg-indigo-500/10",
  };

  return colorMap[status] || "text-gray-500 bg-gray-500/10";
}
