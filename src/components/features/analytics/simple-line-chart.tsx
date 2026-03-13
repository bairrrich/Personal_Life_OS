"use client";

import type { ChartDataPoint } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  height?: number;
  color?: string;
  className?: string;
  showArea?: boolean;
}

export function SimpleLineChart({
  data,
  height = 150,
  color = "oklch(65% 0.25 260)",
  className,
  showArea = true,
}: SimpleLineChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;

  // Generate SVG path
  const width = 100;
  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = 100 - ((point.value - minValue) / range) * 100;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;
  const areaD = `${pathD} L 100,100 L 0,100 Z`;

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {showArea && <path d={areaD} fill={color} fillOpacity="0.2" />}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.5"
              fill={color}
              vectorEffect="non-scaling-stroke"
              className="opacity-0 hover:opacity-100 transition-opacity"
            >
              <title>{`${point.label}: ${point.value}`}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
