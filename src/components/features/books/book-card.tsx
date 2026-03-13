"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Book } from "@/features/books/types";
import { cn } from "@/lib/utils";
import {
  getGenreIcon,
  getGenreColor,
  getStatusIcon,
  getStatusColor,
  getFormatIcon,
} from "@/features/books/categories";
import { Heart, Pencil, Trash2, Star } from "lucide-react";

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  showActions?: boolean;
  className?: string;
}

export function BookCard({
  book,
  onClick,
  onEdit,
  onDelete,
  onToggleFavorite,
  showActions = false,
  className,
}: BookCardProps) {
  const genreIcon = getGenreIcon(book.genre);
  const genreColor = getGenreColor(book.genre);
  const statusIcon = getStatusIcon(book.status);
  const formatIcon = getFormatIcon(book.format);

  // Calculate reading progress
  const readingProgress =
    book.currentPage && book.pages
      ? Math.round((book.currentPage / book.pages) * 100)
      : 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        book.isCustom && "border-primary/20",
        book.isFavorite && "border-yellow-500/50",
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{genreIcon}</span>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                {book.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {book.isFavorite && (
              <Badge
                variant="secondary"
                className="text-xs bg-yellow-500/20 text-yellow-600"
              >
                <Heart className="w-3 h-3 fill-yellow-600" />
              </Badge>
            )}
            {book.rating && (
              <Badge variant="secondary" className="text-xs">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500 mr-1" />
                {book.rating}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Status and Format */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <span className="mr-1">{statusIcon}</span>
              {book.status.replace("_", " ")}
            </Badge>
            <Badge variant="ghost" className="text-xs">
              <span className="mr-1">{formatIcon}</span>
              {book.format}
            </Badge>
          </div>

          {/* Series Info */}
          {book.series && (
            <p className="text-xs text-muted-foreground">
              {book.series}
              {book.seriesPosition && ` #${book.seriesPosition}`}
            </p>
          )}

          {/* Pages Info */}
          {book.pages && (
            <div className="text-sm text-muted-foreground">
              {book.pages} pages
              {book.currentPage && book.status === "reading" && (
                <span className="ml-2 text-foreground">
                  ({book.currentPage} read)
                </span>
              )}
            </div>
          )}

          {/* Reading Progress */}
          {book.status === "reading" && readingProgress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{readingProgress}%</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${readingProgress}%` }}
                />
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
                    book.isFavorite && "fill-red-500 text-red-500",
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
