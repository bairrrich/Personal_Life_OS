// Books Module Utilities

import type {
  Book,
  BookStats,
  BookFilters,
  AuthorStats,
  ReadingGoal,
} from "./types";

/**
 * Calculate reading progress percentage
 */
export function calculateReadingProgress(
  currentPage: number | undefined,
  totalPages: number | undefined,
): number {
  if (!currentPage || !totalPages || totalPages === 0) return 0;
  return Math.round((currentPage / totalPages) * 100);
}

/**
 * Calculate book statistics
 */
export function calculateBookStats(
  books: Book[],
  readingGoal?: ReadingGoal,
): BookStats {
  const stats: BookStats = {
    totalBooks: books.length,
    booksByStatus: {
      want_to_read: 0,
      reading: 0,
      completed: 0,
      abandoned: 0,
    },
    booksByGenre: {},
    booksByFormat: {
      physical: 0,
      ebook: 0,
      audiobook: 0,
      pdf: 0,
      other: 0,
    },
    averageRating: 0,
    totalRead: 0,
    totalReading: 0,
    totalWantToRead: 0,
    completedThisYear: 0,
  };

  const currentYear = new Date().getFullYear();
  let totalRating = 0;
  let ratedBooksCount = 0;

  books.forEach((book) => {
    // Status counts
    stats.booksByStatus[book.status]++;

    // Genre counts
    stats.booksByGenre[book.genre] = (stats.booksByGenre[book.genre] || 0) + 1;

    // Format counts
    stats.booksByFormat[book.format]++;

    // Rating
    if (book.rating) {
      totalRating += book.rating;
      ratedBooksCount++;
    }

    // Status totals
    if (book.status === "completed") {
      stats.totalRead++;
      if (book.dateCompleted) {
        const completedYear = new Date(book.dateCompleted).getFullYear();
        if (completedYear === currentYear) {
          stats.completedThisYear++;
        }
      }
    } else if (book.status === "reading") {
      stats.totalReading++;
    } else if (book.status === "want_to_read") {
      stats.totalWantToRead++;
    }
  });

  // Average rating
  if (ratedBooksCount > 0) {
    stats.averageRating = Math.round((totalRating / ratedBooksCount) * 10) / 10;
  }

  // Reading goal progress
  if (readingGoal) {
    stats.readingGoalProgress = {
      target: readingGoal.targetBooks,
      completed: stats.completedThisYear,
      percentage: Math.round(
        (stats.completedThisYear / readingGoal.targetBooks) * 100,
      ),
    };
  }

  return stats;
}

/**
 * Filter books by search query
 */
export function filterBooksBySearch(books: Book[], query: string): Book[] {
  if (!query.trim()) return books;

  const searchQuery = query.toLowerCase().trim();

  return books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery) ||
      book.author.toLowerCase().includes(searchQuery) ||
      book.description?.toLowerCase().includes(searchQuery) ||
      book.series?.toLowerCase().includes(searchQuery) ||
      book.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
  );
}

/**
 * Filter books by filters
 */
export function filterBooks(books: Book[], filters: BookFilters): Book[] {
  let filtered = [...books];

  if (filters.status) {
    filtered = filtered.filter((book) => book.status === filters.status);
  }

  if (filters.genre) {
    filtered = filtered.filter((book) => book.genre === filters.genre);
  }

  if (filters.format) {
    filtered = filtered.filter((book) => book.format === filters.format);
  }

  if (filters.isFavorite !== undefined) {
    filtered = filtered.filter(
      (book) => book.isFavorite === filters.isFavorite,
    );
  }

  if (filters.hasRating) {
    filtered = filtered.filter((book) => book.rating !== undefined);
  }

  if (filters.minRating !== undefined) {
    filtered = filtered.filter(
      (book) => (book.rating || 0) >= filters.minRating!,
    );
  }

  if (filters.search) {
    filtered = filterBooksBySearch(filtered, filters.search);
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((book) =>
      book.tags?.some((tag) => filters.tags!.includes(tag)),
    );
  }

  return filtered;
}

/**
 * Sort books by various criteria
 */
export function sortBooks(
  books: Book[],
  sortBy:
    | "title"
    | "author"
    | "dateAdded"
    | "dateCompleted"
    | "rating"
    | "currentPage",
  sortOrder: "asc" | "desc" = "asc",
): Book[] {
  return [...books].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "author":
        comparison = a.author.localeCompare(b.author);
        break;
      case "dateAdded":
        comparison = a.dateAdded - b.dateAdded;
        break;
      case "dateCompleted":
        comparison = (a.dateCompleted || 0) - (b.dateCompleted || 0);
        break;
      case "rating":
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case "currentPage":
        comparison = (a.currentPage || 0) - (b.currentPage || 0);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
}

/**
 * Get author statistics
 */
export function getAuthorStats(books: Book[]): AuthorStats[] {
  const authorMap = new Map<
    string,
    { books: Book[]; totalRating: number; ratedCount: number }
  >();

  books.forEach((book) => {
    const existing = authorMap.get(book.author) || {
      books: [],
      totalRating: 0,
      ratedCount: 0,
    };

    existing.books.push(book);
    if (book.rating) {
      existing.totalRating += book.rating;
      existing.ratedCount++;
    }

    authorMap.set(book.author, existing);
  });

  const stats: AuthorStats[] = [];

  authorMap.forEach((data, authorName) => {
    stats.push({
      name: authorName,
      booksCount: data.books.length,
      averageRating:
        data.ratedCount > 0
          ? Math.round((data.totalRating / data.ratedCount) * 10) / 10
          : 0,
      completedBooks: data.books.filter((b) => b.status === "completed").length,
    });
  });

  return stats.sort((a, b) => b.booksCount - a.booksCount);
}

/**
 * Check if book is currently being read
 */
export function isCurrentlyReading(book: Book): boolean {
  return book.status === "reading";
}

/**
 * Check if book has been completed
 */
export function isCompleted(book: Book): boolean {
  return book.status === "completed";
}

/**
 * Get reading streak (consecutive days with reading activity)
 */
export function getReadingStreak(completedBooks: Book[]): number {
  if (completedBooks.length === 0) return 0;

  const completedDates = completedBooks
    .filter((book) => book.dateCompleted)
    .map((book) => new Date(book.dateCompleted!).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (completedDates.length === 0) return 0;

  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if read today or yesterday
  if (completedDates[0] !== today && completedDates[0] !== yesterday) {
    return 0;
  }

  for (let i = 1; i < completedDates.length; i++) {
    const currentDate = new Date(completedDates[i - 1]);
    const prevDate = new Date(completedDates[i]);
    const diffDays = Math.round(
      (currentDate.getTime() - prevDate.getTime()) / 86400000,
    );

    if (diffDays === 1) {
      streak++;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}

/**
 * Format pages for display
 */
export function formatPages(pages?: number): string {
  if (!pages) return "Unknown";
  return `${pages} pages`;
}

/**
 * Calculate estimated reading time (assuming 250 words per minute, ~300 words per page)
 */
export function calculateReadingTimeMinutes(pages: number): number {
  const wordsPerMinute = 250;
  const wordsPerPage = 300;
  return Math.round((pages * wordsPerPage) / wordsPerMinute);
}

/**
 * Format reading time for display
 */
export function formatReadingTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}
