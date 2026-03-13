"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/features/products/types";
import { cn } from "@/lib/utils";
import {
  getCategoryIcon,
  getCategoryColor,
} from "@/features/products/categories";
import { Heart, Pencil, Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  showActions?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  showActions = false,
  className,
}: ProductCardProps) {
  const categoryIcon = getCategoryIcon(product.category);
  const categoryColor = getCategoryColor(product.category);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        product.isCustom && "border-primary/20",
        product.isFavorite && "border-yellow-500/50",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{categoryIcon}</span>
            <CardTitle className="text-lg line-clamp-1">
              {product.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {product.isFavorite && (
              <Badge
                variant="secondary"
                className="text-xs bg-yellow-500/20 text-yellow-600"
              >
                <Heart className="w-3 h-3 fill-yellow-600" />
              </Badge>
            )}
            {product.isCustom && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
        </div>
        {product.brand && (
          <p className="text-sm text-muted-foreground">{product.brand}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Price */}
          {product.defaultPrice && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price:</span>
              <span className="font-semibold text-lg">
                {product.defaultPrice.toFixed(2)} {product.currency}
              </span>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Quantity:</span>
            <span className="font-medium">
              {product.defaultQuantity} {product.defaultUnit}
            </span>
          </div>

          {/* Nutrition Info */}
          {product.nutritionPer100g && (
            <div className="grid grid-cols-4 gap-2 pt-2 border-t">
              <div className="text-center">
                <div className="text-sm font-bold text-orange-500">
                  {product.nutritionPer100g.calories}
                </div>
                <div className="text-xs text-muted-foreground">kcal</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-blue-500">
                  {product.nutritionPer100g.protein}g
                </div>
                <div className="text-xs text-muted-foreground">protein</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-yellow-500">
                  {product.nutritionPer100g.fat}g
                </div>
                <div className="text-xs text-muted-foreground">fat</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-green-500">
                  {product.nutritionPer100g.carbs}g
                </div>
                <div className="text-xs text-muted-foreground">carbs</div>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.();
                }}
              >
                <Heart
                  className={cn(
                    "w-4 h-4",
                    product.isFavorite && "fill-red-500 text-red-500",
                  )}
                />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
