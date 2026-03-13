// Books Module Types

export type BookStatus = "want_to_read" | "reading" | "completed" | "abandoned";

export type BookFormat = "physical" | "ebook" | "audiobook" | "pdf" | "other";

export type BookGenre =
  | "fiction"
  | "non_fiction"
  | "science_fiction"
  | "fantasy"
  | "mystery"
  | "thriller"
  | "romance"
  | "horror"
  | "biography"
  | "history"
  | "science"
  | "technology"
  | "business"
  | "self_help"
  | "philosophy"
  | "psychology"
  | "art"
  | "cooking"
  | "travel"
  | "children"
  | "young_adult"
  | "poetry"
  | "other";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  language?: string;
  pages?: number;
  genre: BookGenre;
  subgenre?: string;
  description?: string;
  coverImage?: string;
  format: BookFormat;
  status: BookStatus;
  rating?: number; // 1-5
  review?: string;
  tags?: string[];
  series?: string;
  seriesPosition?: number;
  dateAdded: number;
  dateStarted?: number;
  dateCompleted?: number;
  currentPage?: number; // For tracking reading progress
  isFavorite: boolean;
  isCustom: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BookNote {
  id: string;
  bookId: string;
  content: string;
  page?: number;
  chapter?: string;
  type: "quote" | "note" | "highlight";
  createdAt: number;
  updatedAt: number;
}

export interface ReadingGoal {
  id: string;
  year: number;
  targetBooks: number;
  completedBooks: number;
  createdAt: number;
  updatedAt: number;
}

export interface BookStats {
  totalBooks: number;
  booksByStatus: Record<BookStatus, number>;
  booksByGenre: Record<string, number>;
  booksByFormat: Record<BookFormat, number>;
  averageRating: number;
  totalRead: number;
  totalReading: number;
  totalWantToRead: number;
  completedThisYear: number;
  readingGoalProgress?: {
    target: number;
    completed: number;
    percentage: number;
  };
}

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  language?: string;
  pages?: number;
  genre: BookGenre;
  subgenre?: string;
  description?: string;
  coverImage?: string;
  format: BookFormat;
  status: BookStatus;
  rating?: number;
  review?: string;
  tags?: string[];
  series?: string;
  seriesPosition?: number;
  currentPage?: number;
  isFavorite?: boolean;
}

export interface UpdateBookInput {
  id: string;
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  publishYear?: number;
  language?: string;
  pages?: number;
  genre?: BookGenre;
  subgenre?: string;
  description?: string;
  coverImage?: string;
  format?: BookFormat;
  status?: BookStatus;
  rating?: number;
  review?: string;
  tags?: string[];
  series?: string;
  seriesPosition?: number;
  currentPage?: number;
  dateStarted?: number;
  dateCompleted?: number;
  isFavorite?: boolean;
}

export interface CreateBookNoteInput {
  bookId: string;
  content: string;
  page?: number;
  chapter?: string;
  type: "quote" | "note" | "highlight";
}

export interface UpdateBookNoteInput {
  id: string;
  content?: string;
  page?: number;
  chapter?: string;
  type?: "quote" | "note" | "highlight";
}

export interface BookFilters {
  status?: BookStatus;
  genre?: BookGenre;
  format?: BookFormat;
  search?: string;
  isFavorite?: boolean;
  hasRating?: boolean;
  minRating?: number;
  tags?: string[];
}

export interface AuthorStats {
  name: string;
  booksCount: number;
  averageRating: number;
  completedBooks: number;
}
