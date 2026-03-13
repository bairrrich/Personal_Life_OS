"use client";

import type { ChartDataPoint } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

interface SimpleBarChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  className?: string;
  showLabels?: boolean;
}

export function SimpleBarChart({
  data,
  height = 150,
  color = "oklch(65% 0.25 260)",
  className,
  showLabels = false,
}: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1 h-[150px]" style={{ height }}>
        {data.map((point, index) => {
          const barHeight = (point.value / maxValue) * 100;
          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <div
                className="w-full rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${barHeight}%`,
                  backgroundColor: point.value > 0 ? color : "transparent",
                  minHeight: point.value > 0 ? "4px" : "0",
                }}
                title={`${point.label}: ${point.value}`}
              />
              {showLabels && (
                <span className="text-[10px] text-muted-foreground rotate-45 origin-top-left whitespace-nowrap">
                  {point.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
