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
import {
  bookGenres,
  bookStatuses,
  bookFormats,
} from "@/features/books/categories";
import type { BookGenre, BookStatus, BookFormat } from "@/features/books/types";
import { Filter, X } from "lucide-react";
import type { BookFilters } from "@/features/books/types";

interface BookFiltersProps {
  filters: BookFilters;
  onFilterChange: (filters: BookFilters) => void;
  className?: string;
}

export function BookFiltersPanel({
  filters,
  onFilterChange,
  className,
}: BookFiltersProps) {
  const handleGenreChange = (genre: string) => {
    onFilterChange({
      ...filters,
      genre: genre === "all" ? undefined : (genre as BookGenre),
    });
  };

  const handleStatusChange = (status: string) => {
    onFilterChange({
      ...filters,
      status: status === "all" ? undefined : (status as BookStatus),
    });
  };

  const handleFormatChange = (format: string) => {
    onFilterChange({
      ...filters,
      format: format === "all" ? undefined : (format as BookFormat),
    });
  };

  const handleRatingChange = (value: string) => {
    if (value === "all") {
      const { minRating, hasRating, ...rest } = filters;
      onFilterChange(rest);
    } else {
      onFilterChange({
        ...filters,
        minRating: Number(value),
      });
    }
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters =
    filters.genre ||
    filters.status ||
    filters.format ||
    filters.minRating ||
    filters.isFavorite !== undefined;

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className || ""}`}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {bookStatuses.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              <span className="flex items-center gap-2">
                <span>{s.icon}</span>
                <span>{s.nameKey.replace("books.status.", "")}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Genre Filter */}
      <Select value={filters.genre || "all"} onValueChange={handleGenreChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All genres" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All genres</SelectItem>
          {bookGenres.slice(0, 10).map((g) => (
            <SelectItem key={g.id} value={g.id}>
              <span className="flex items-center gap-2">
                <span>{g.icon}</span>
                <span>{g.nameKey.replace("books.genres.", "")}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Format Filter */}
      <Select
        value={filters.format || "all"}
        onValueChange={handleFormatChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="All formats" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All formats</SelectItem>
          {bookFormats.map((f) => (
            <SelectItem key={f.id} value={f.id}>
              <span className="flex items-center gap-2">
                <span>{f.icon}</span>
                <span>{f.nameKey.replace("books.format.", "")}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Rating Filter */}
      <Select
        value={filters.minRating?.toString() || "all"}
        onValueChange={handleRatingChange}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Min rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Any rating</SelectItem>
          <SelectItem value="1">⭐ 1+ stars</SelectItem>
          <SelectItem value="2">⭐⭐ 2+ stars</SelectItem>
          <SelectItem value="3">⭐⭐⭐ 3+ stars</SelectItem>
          <SelectItem value="4">⭐⭐⭐⭐ 4+ stars</SelectItem>
          <SelectItem value="5">⭐⭐⭐⭐⭐ 5 stars</SelectItem>
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
          {filters.status && (
            <Badge variant="secondary" className="text-xs">
              {filters.status.replace("_", " ")}
            </Badge>
          )}
          {filters.genre && (
            <Badge variant="secondary" className="text-xs">
              {filters.genre.replace("_", " ")}
            </Badge>
          )}
          {filters.format && (
            <Badge variant="secondary" className="text-xs">
              {filters.format}
            </Badge>
          )}
          {filters.minRating && (
            <Badge variant="secondary" className="text-xs">
              {filters.minRating}+ ⭐
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
