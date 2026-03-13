"use client";

import { ReactNode } from "react";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { cn } from "@/lib/utils";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon?: ReactNode;
  color?: string;
  className?: string;
  children?: ReactNode;
}

export function AnalyticsCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  color = "from-blue-500 to-blue-600",
  className,
  children,
}: AnalyticsCardProps) {
  const trendColor =
    trend !== undefined
      ? trend >= 0
        ? "text-green-500"
        : "text-red-500"
      : undefined;

  return (
    <GlassCard className={cn("p-4", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div
            className={cn("rounded-xl p-2 text-white bg-gradient-to-br", color)}
          >
            {icon}
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <span className={cn("text-xs font-medium", trendColor)}>
            {trend >= 0 ? "+" : ""}
            {trend.toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-muted-foreground">{trendLabel}</span>
          )}
        </div>
      )}
      {children}
    </GlassCard>
  );
}
