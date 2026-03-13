// Books Module - Client-side hooks and utilities

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Book,
  BookNote,
  ReadingGoal,
  BookFilters,
  CreateBookInput,
  UpdateBookInput,
  CreateBookNoteInput,
  UpdateBookNoteInput,
} from "./types";
import {
  createBook,
  updateBook,
  deleteBook,
  getBooks,
  getBookById,
  toggleBookFavorite,
  updateBookProgress,
  createBookNote,
  updateBookNote,
  deleteBookNote,
  getBookNotes,
  setReadingGoal,
  getReadingGoal,
} from "./actions";

// Re-export types
export type { BookFilters };

/**
 * Hook for managing books
 */
export function useBooks(filters?: BookFilters) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBooks(filters);
      setBooks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  return {
    books,
    loading,
    error,
    refresh: loadBooks,
  };
}

/**
 * Hook for managing a single book
 */
export function useBook(id?: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const data = await getBookById(id);
      setBook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load book");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  const update = async (input: UpdateBookInput) => {
    const result = await updateBook(input);
    if (result.success && result.data) {
      setBook(result.data);
    }
    return result;
  };

  const remove = async () => {
    if (!id) return { success: false, error: "No book ID" };
    const result = await deleteBook(id);
    if (result.success) {
      setBook(null);
    }
    return result;
  };

  const toggleFavorite = async () => {
    if (!id) return { success: false, error: "No book ID" };
    const result = await toggleBookFavorite(id);
    if (result.success && book) {
      setBook({ ...book, isFavorite: result.isFavorite || false });
    }
    return result;
  };

  const updateProgress = async (currentPage: number) => {
    const result = await updateBookProgress(id!, currentPage);
    if (result.success && book) {
      setBook({ ...book, currentPage });
    }
    return result;
  };

  return {
    book,
    loading,
    error,
    refresh: loadBook,
    update,
    remove,
    toggleFavorite,
    updateProgress,
  };
}

/**
 * Hook for managing book notes
 */
export function useBookNotes(bookId?: string) {
  const [notes, setNotes] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getBookNotes(bookId);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const addNote = async (input: CreateBookNoteInput) => {
    const result = await createBookNote(input);
    if (result.success && result.data) {
      setNotes((prev) => [result.data!, ...prev]);
    }
    return result;
  };

  const updateNote = async (input: UpdateBookNoteInput) => {
    const result = await updateBookNote(input);
    if (result.success && result.data) {
      setNotes((prev) =>
        prev.map((note) => (note.id === input.id ? result.data! : note)),
      );
    }
    return result;
  };

  const removeNote = async (id: string) => {
    const result = await deleteBookNote(id);
    if (result.success) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    }
    return result;
  };

  return {
    notes,
    loading,
    error,
    refresh: loadNotes,
    addNote,
    updateNote,
    removeNote,
  };
}

/**
 * Hook for managing reading goal
 */
export function useReadingGoal(year?: number) {
  const [goal, setGoal] = useState<ReadingGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadGoal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReadingGoal(year);
      setGoal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load goal");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  const setGoalData = async (targetBooks: number) => {
    const targetYear = year || new Date().getFullYear();
    const result = await setReadingGoal(targetYear, targetBooks);
    if (result.success && result.data) {
      setGoal(result.data);
    }
    return result;
  };

  return {
    goal,
    loading,
    error,
    refresh: loadGoal,
    setGoal: setGoalData,
  };
}

/**
 * Hook for creating/editing books
 */
export function useBookForm(onSuccess?: () => void, initialData?: Book) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: CreateBookInput | UpdateBookInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = initialData
        ? await updateBook(data as UpdateBookInput)
        : await createBook(data as CreateBookInput);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || "Operation failed");
      }

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submit,
  };
}

// Re-export actions for direct use
export {
  createBook,
  updateBook,
  deleteBook,
  getBooks,
  getBookById,
  toggleBookFavorite,
  updateBookProgress,
  createBookNote,
  updateBookNote,
  deleteBookNote,
  getBookNotes,
  setReadingGoal,
  getReadingGoal,
};
