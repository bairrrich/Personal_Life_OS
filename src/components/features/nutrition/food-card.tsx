"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FoodItem } from "@/features/nutrition/types";
import { cn } from "@/lib/utils";

interface FoodCardProps {
  food: FoodItem;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  className?: string;
}

export function FoodCard({
  food,
  onClick,
  onEdit,
  onDelete,
  showActions = false,
  className,
}: FoodCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        food.isCustom && "border-primary/20",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{food.name}</CardTitle>
          {food.isCustom && (
            <Badge variant="secondary" className="text-xs">
              Custom
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Serving:</span>
            <span className="font-medium">{food.servingSize}g</span>
          </div>
          <div className="grid grid-cols-4 gap-2 pt-2">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-500">
                {food.macros.calories}
              </div>
              <div className="text-xs text-muted-foreground">kcal</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-500">
                {food.macros.protein}g
              </div>
              <div className="text-xs text-muted-foreground">protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-500">
                {food.macros.fat}g
              </div>
              <div className="text-xs text-muted-foreground">fat</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-500">
                {food.macros.carbs}g
              </div>
              <div className="text-xs text-muted-foreground">carbs</div>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
