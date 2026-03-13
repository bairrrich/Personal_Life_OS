"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  height?: number;
  className?: string;
}

export function BarChart({
  data,
  title,
  height = 200,
  className,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <Card className={cn("", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div
          className="flex items-end justify-between gap-2"
          style={{ height }}
        >
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 40);
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t transition-all hover:opacity-80"
                  style={{
                    height: Math.max(barHeight, 4),
                    backgroundColor: item.color || "hsl(var(--primary))",
                  }}
                  title={`${item.label}: ${item.value}`}
                />
                <span className="text-xs text-muted-foreground rotate-0 sm:-rotate-45 text-center truncate w-full">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface LineChartProps {
  data: Array<{
    label: string;
    value: number;
  }>;
  title?: string;
  height?: number;
  color?: string;
  className?: string;
}

export function LineChart({
  data,
  title,
  height = 200,
  color = "hsl(var(--primary))",
  className,
}: LineChartProps) {
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const minValue = Math.min(...data.map((d) => d.value), 0);
  const range = maxValue - minValue || 1;
  const padding = 40;
  const chartHeight = height - padding * 2;
  const chartWidth = 100; // percentage

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * chartWidth;
      const y = 100 - ((item.value - minValue) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,100 ${points} ${chartWidth},100`;

  return (
    <Card className={cn("", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="relative" style={{ height }}>
          <svg
            viewBox={`0 0 ${chartWidth} 100`}
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="hsl(var(--border))"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}

            {/* Area fill */}
            <polygon points={areaPoints} fill={color} fillOpacity="0.1" />

            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * chartWidth;
              const y = 100 - ((item.value - minValue) / range) * 100;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={color}
                  className="hover:r-3 transition-all"
                />
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-muted-foreground">
            {data.map((item, index) => (
              <span
                key={index}
                className="text-center truncate"
                style={{
                  width: `${100 / data.length}%`,
                }}
              >
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MacrosPieChartProps {
  protein: number;
  fat: number;
  carbs: number;
  title?: string;
  size?: number;
  className?: string;
}

export function MacrosPieChart({
  protein,
  fat,
  carbs,
  title,
  size = 200,
  className,
}: MacrosPieChartProps) {
  const total = protein + fat + carbs;

  if (total === 0) {
    return (
      <Card className={cn("", className)}>
        {title && (
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent
          className="flex items-center justify-center"
          style={{ height: size }}
        >
          <p className="text-muted-foreground">No data</p>
        </CardContent>
      </Card>
    );
  }

  const proteinPercent = Math.round((protein / total) * 100);
  const fatPercent = Math.round((fat / total) * 100);
  const carbsPercent = Math.round((carbs / total) * 100);

  const proteinAngle = (proteinPercent / 100) * 360;
  const fatAngle = (fatPercent / 100) * 360;

  // Convert polar to cartesian coordinates
  const getCoordinates = (angle: number, radius: number = 50) => {
    const radian = ((angle - 90) * Math.PI) / 180;
    return {
      x: 50 + radius * Math.cos(radian),
      y: 50 + radius * Math.sin(radian),
    };
  };

  const proteinEnd = getCoordinates(proteinAngle);
  const fatEnd = getCoordinates(proteinAngle + fatAngle);

  // Create SVG path for pie slices
  const getArcPath = (startAngle: number, endAngle: number) => {
    const start = getCoordinates(startAngle);
    const end = getCoordinates(endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M 50 50 L ${start.x} ${start.y} A 50 50 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  return (
    <Card className={cn("", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent
        className="flex flex-col items-center"
        style={{ height: size }}
      >
        <div className="relative">
          <svg width={size - 40} height={size - 40} viewBox="0 0 100 100">
            {/* Protein slice */}
            {proteinPercent > 0 && (
              <path
                d={getArcPath(0, proteinAngle)}
                fill="#3b82f6"
                className="hover:opacity-80 transition-opacity"
              />
            )}

            {/* Fat slice */}
            {fatPercent > 0 && (
              <path
                d={getArcPath(proteinAngle, proteinAngle + fatAngle)}
                fill="#eab308"
                className="hover:opacity-80 transition-opacity"
              />
            )}

            {/* Carbs slice */}
            {carbsPercent > 0 && (
              <path
                d={getArcPath(proteinAngle + fatAngle, 360)}
                fill="#22c55e"
                className="hover:opacity-80 transition-opacity"
              />
            )}

            {/* Center circle for donut effect */}
            <circle cx="50" cy="50" r="25" fill="hsl(var(--card))" />
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total}g</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Protein {proteinPercent}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Fat {fatPercent}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Carbs {carbsPercent}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
