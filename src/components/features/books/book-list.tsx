"use client";

import type { Book } from "@/features/books/types";
import { BookCard } from "./book-card";
import { cn } from "@/lib/utils";

interface BookListProps {
  books: Book[];
  loading?: boolean;
  emptyMessage?: string;
  onBookClick?: (book: Book) => void;
  onBookEdit?: (book: Book) => void;
  onBookDelete?: (book: Book) => void;
  onBookFavorite?: (book: Book) => void;
  showActions?: boolean;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function BookList({
  books,
  loading = false,
  emptyMessage = "No books found",
  onBookClick,
  onBookEdit,
  onBookDelete,
  onBookFavorite,
  showActions = false,
  className,
  columns = 3,
}: BookListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onClick={() => onBookClick?.(book)}
          onEdit={() => onBookEdit?.(book)}
          onDelete={() => onBookDelete?.(book)}
          onToggleFavorite={() => onBookFavorite?.(book)}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
