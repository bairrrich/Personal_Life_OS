"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BaseEntity } from "@/entity-engine/types";
import { cn } from "@/lib/utils";

interface EntityCardProps {
  entity: BaseEntity;
  onClick?: () => void;
  className?: string;
  showType?: boolean;
}

export function EntityCard({
  entity,
  onClick,
  className,
  showType = false,
}: EntityCardProps) {
  const dataType = entity.type.charAt(0).toUpperCase() + entity.type.slice(1);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        entity.deleted && "opacity-50",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{entity.name}</CardTitle>
          {showType && (
            <Badge variant="secondary" className="text-xs">
              {dataType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          {Object.entries(entity.data)
            .slice(0, 4)
            .map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground capitalize">{key}:</span>
                <span className="font-medium">
                  {typeof value === "number" && key.includes("date")
                    ? new Date(value).toLocaleDateString()
                    : typeof value === "number"
                      ? value.toFixed(2)
                      : String(value)}
                </span>
              </div>
            ))}
        </div>
        {entity.deleted && (
          <Badge variant="destructive" className="mt-2">
            Deleted
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
