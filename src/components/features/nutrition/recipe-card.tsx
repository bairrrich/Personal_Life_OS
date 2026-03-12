"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        "cursor-pointer transition-shadow hover:shadow-md",
        className,
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{recipe.name}</CardTitle>
          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
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
        {recipe.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {recipe.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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

          {/* Ingredients Preview */}
          <div className="text-xs text-muted-foreground">
            {recipe.ingredients.length} ingredient
            {recipe.ingredients.length !== 1 ? "s" : ""}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
