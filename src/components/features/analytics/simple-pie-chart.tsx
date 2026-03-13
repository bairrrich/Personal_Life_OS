"use client";

import type { PieChartData } from "@/features/analytics/types";
import { cn } from "@/lib/utils";

interface SimplePieChartProps {
  data: PieChartData[];
  size?: number;
  className?: string;
  showLabels?: boolean;
}

export function SimplePieChart({
  data,
  size = 150,
  className,
  showLabels = true,
}: SimplePieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-muted-foreground">No data</span>
      </div>
    );
  }

  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((item, index) => {
    const percent = item.value / total;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;

    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);

    const largeArcFlag = percent > 0.5 ? 1 : 0;

    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`,
    ].join(" ");

    return {
      pathData,
      color: item.color,
      name: item.name,
      value: item.value,
      percent: percent * 100,
      icon: item.icon,
    };
  });

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <svg
        viewBox="-1 -1 2 2"
        style={{ width: size, height: size }}
        className="transform -rotate-90"
      >
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            className="transition-opacity hover:opacity-80"
            style={{ transformOrigin: "center" }}
          >
            <title>{`${slice.name}: ${slice.value} (${slice.percent.toFixed(1)}%)`}</title>
          </path>
        ))}
        {/* Center circle for donut effect */}
        <circle cx="0" cy="0" r="0.6" fill="transparent" />
      </svg>

      {showLabels && (
        <div className="flex flex-col gap-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-muted-foreground">{slice.name}</span>
              <span className="font-medium">{slice.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
