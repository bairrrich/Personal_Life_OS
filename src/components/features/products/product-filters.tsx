"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { productCategories } from "@/features/products/categories";
import type { ProductCategoryType } from "@/features/products/types";
import { Filter, X } from "lucide-react";
import type { ProductFilters } from "@/features/products/types";

interface ProductFiltersProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  className?: string;
}

export function ProductFiltersPanel({
  filters,
  onFilterChange,
  className,
}: ProductFiltersProps) {
  const handleCategoryChange = (category: string) => {
    onFilterChange({
      ...filters,
      category:
        category === "all" ? undefined : (category as ProductCategoryType),
    });
  };

  const handleFavoriteChange = (value: string) => {
    if (value === "all") {
      const { isFavorite, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...filters,
        isFavorite: value === "favorites",
      });
    }
  };

  const handlePriceChange = (value: string) => {
    if (value === "all") {
      const { hasPrice, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...filters,
        hasPrice: value === "hasPrice",
      });
    }
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    filters.category || filters.isFavorite !== undefined || filters.hasPrice;

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className || ""}`}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {/* Category Filter */}
      <Select
        value={filters.category || "all"}
        onValueChange={handleCategoryChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          {productCategories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <span className="flex items-center gap-2">
                <span>{cat.icon}</span>
                <span>{cat.nameKey.replace("products.categories.", "")}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Favorites Filter */}
      <Select
        value={
          filters.isFavorite === undefined
            ? "all"
            : filters.isFavorite
              ? "favorites"
              : "notFavorites"
        }
        onValueChange={handleFavoriteChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Favorites" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="favorites">⭐ Favorites</SelectItem>
          <SelectItem value="notFavorites">Not favorites</SelectItem>
        </SelectContent>
      </Select>

      {/* Price Filter */}
      <Select
        value={
          filters.hasPrice === undefined
            ? "all"
            : filters.hasPrice
              ? "hasPrice"
              : "noPrice"
        }
        onValueChange={handlePriceChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Price" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All prices</SelectItem>
          <SelectItem value="hasPrice">Has price</SelectItem>
          <SelectItem value="noPrice">No price</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8"
        >
          <X className="w-3 h-3 mr-1" />
          Clear
        </Button>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex gap-1 ml-auto">
          {filters.category && (
            <Badge variant="secondary" className="text-xs">
              {filters.category}
            </Badge>
          )}
          {filters.isFavorite !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {filters.isFavorite ? "⭐ Favorites" : "Not favorites"}
            </Badge>
          )}
          {filters.hasPrice !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {filters.hasPrice ? "Has price" : "No price"}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
