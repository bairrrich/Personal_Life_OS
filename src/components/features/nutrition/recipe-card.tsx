"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Recipe } from "@/features/nutrition/types";
import { cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  onEdit?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  showActions?: boolean;
  className?: string;
}

export function RecipeCard({
  recipe,
  onEdit,
  onDelete,
  onSelect,
  showActions = false,
  className,
}: RecipeCardProps) {
  const macrosPerServing = {
    calories: Math.round(recipe.totalMacros.calories / recipe.servings),
    protein:
      Math.round((recipe.totalMacros.protein / recipe.servings) * 10) / 10,
    fat: Math.round((recipe.totalMacros.fat / recipe.servings) * 10) / 10,
    carbs: Math.round((recipe.totalMacros.carbs / recipe.servings) * 10) / 10,
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md overflow-hidden",
        className,
      )}
      onClick={onSelect}
    >
      {/* Recipe Image */}
      {recipe.image ? (
        <div className="relative h-40 w-full overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-40 w-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
          <span className="text-4xl">🍽️</span>
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1">
              {recipe.name}
            </CardTitle>
            {showActions && (
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Edit</span>✏️
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <span className="sr-only">Delete</span>🗑️
                </Button>
              </div>
            )}
          </div>
          {recipe.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recipe.description}
            </p>
          )}
        </div>

        {/* Time and Servings */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {totalTime > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{totalTime} min</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        {/* Macros per Serving */}
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-lg font-bold text-orange-500">
              {macrosPerServing.calories}
            </div>
            <div className="text-xs text-muted-foreground">kcal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-500">
              {macrosPerServing.protein}g
            </div>
            <div className="text-xs text-muted-foreground">P</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-500">
              {macrosPerServing.fat}g
            </div>
            <div className="text-xs text-muted-foreground">F</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-500">
              {macrosPerServing.carbs}g
            </div>
            <div className="text-xs text-muted-foreground">C</div>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
