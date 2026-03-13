"use server";

import { revalidatePath } from "next/cache";
import {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntitiesByType,
  getEntityById,
  queryEntities,
} from "@/entity-engine/engine";
import type {
  BookEntity,
  BookNoteEntity,
  ReadingGoalEntity,
} from "@/entity-engine/types";
import type {
  Book,
  BookNote,
  ReadingGoal,
  CreateBookInput,
  UpdateBookInput,
  CreateBookNoteInput,
  UpdateBookNoteInput,
  BookFilters,
} from "./types";

/**
 * =====================
 * BOOK ACTIONS
 * =====================
 */

export async function createBook(
  input: CreateBookInput,
): Promise<{ success: boolean; data?: Book; error?: string }> {
  "use server";
  try {
    const now = Date.now();

    const id = await createEntity<BookEntity>({
      type: "book",
      name: input.title,
      data: {
        author: input.author,
        isbn: input.isbn,
        publisher: input.publisher,
        publishYear: input.publishYear,
        language: input.language,
        pages: input.pages,
        genre: input.genre,
        subgenre: input.subgenre,
        description: input.description,
        coverImage: input.coverImage,
        format: input.format,
        status: input.status,
        rating: input.rating,
        review: input.review,
        tags: input.tags,
        series: input.series,
        seriesPosition: input.seriesPosition,
        currentPage: input.currentPage,
        isFavorite: input.isFavorite || false,
        isCustom: true,
      },
    });

    revalidatePath("/books");

    const book: Book = {
      id,
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      publisher: input.publisher,
      publishYear: input.publishYear,
      language: input.language,
      pages: input.pages,
      genre: input.genre,
      subgenre: input.subgenre,
      description: input.description,
      coverImage: input.coverImage,
      format: input.format,
      status: input.status,
      rating: input.rating,
      review: input.review,
      tags: input.tags,
      series: input.series,
      seriesPosition: input.seriesPosition,
      currentPage: input.currentPage,
      isFavorite: input.isFavorite || false,
      isCustom: true,
      dateAdded: now,
      dateStarted: input.status === "reading" ? now : undefined,
      dateCompleted: input.status === "completed" ? now : undefined,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: book };
  } catch (error) {
    console.error("Failed to create book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateBook(
  input: UpdateBookInput,
): Promise<{ success: boolean; data?: Book; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "book") {
      return { success: false, error: "Book not found" };
    }

    const bookEntity = entity as BookEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.author !== undefined) updateData.author = input.author;
    if (input.isbn !== undefined) updateData.isbn = input.isbn;
    if (input.publisher !== undefined) updateData.publisher = input.publisher;
    if (input.publishYear !== undefined)
      updateData.publishYear = input.publishYear;
    if (input.language !== undefined) updateData.language = input.language;
    if (input.pages !== undefined) updateData.pages = input.pages;
    if (input.genre !== undefined) updateData.genre = input.genre;
    if (input.subgenre !== undefined) updateData.subgenre = input.subgenre;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.coverImage !== undefined)
      updateData.coverImage = input.coverImage;
    if (input.format !== undefined) updateData.format = input.format;
    if (input.status !== undefined) {
      updateData.status = input.status;
      // Auto-set dateStarted when status changes to reading
      if (input.status === "reading" && !bookEntity.data.dateStarted) {
        updateData.dateStarted = now;
      }
      // Auto-set dateCompleted when status changes to completed
      if (input.status === "completed" && !bookEntity.data.dateCompleted) {
        updateData.dateCompleted = now;
      }
    }
    if (input.rating !== undefined) updateData.rating = input.rating;
    if (input.review !== undefined) updateData.review = input.review;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.series !== undefined) updateData.series = input.series;
    if (input.seriesPosition !== undefined)
      updateData.seriesPosition = input.seriesPosition;
    if (input.currentPage !== undefined)
      updateData.currentPage = input.currentPage;
    if (input.dateStarted !== undefined)
      updateData.dateStarted = input.dateStarted;
    if (input.dateCompleted !== undefined)
      updateData.dateCompleted = input.dateCompleted;
    if (input.isFavorite !== undefined)
      updateData.isFavorite = input.isFavorite;

    await updateEntity(input.id, updateData);

    revalidatePath("/books");

    const updatedEntity = (await getEntityById(input.id)) as BookEntity;

    const book: Book = {
      id: updatedEntity.id,
      title: updatedEntity.name,
      author: updatedEntity.data.author as string,
      isbn: updatedEntity.data.isbn as string | undefined,
      publisher: updatedEntity.data.publisher as string | undefined,
      publishYear: updatedEntity.data.publishYear as number | undefined,
      language: updatedEntity.data.language as string | undefined,
      pages: updatedEntity.data.pages as number | undefined,
      genre: updatedEntity.data.genre as any,
      subgenre: updatedEntity.data.subgenre as string | undefined,
      description: updatedEntity.data.description as string | undefined,
      coverImage: updatedEntity.data.coverImage as string | undefined,
      format: updatedEntity.data.format as any,
      status: updatedEntity.data.status as any,
      rating: updatedEntity.data.rating as number | undefined,
      review: updatedEntity.data.review as string | undefined,
      tags: updatedEntity.data.tags as string[] | undefined,
      series: updatedEntity.data.series as string | undefined,
      seriesPosition: updatedEntity.data.seriesPosition as number | undefined,
      currentPage: updatedEntity.data.currentPage as number | undefined,
      isFavorite: updatedEntity.data.isFavorite as boolean,
      isCustom: updatedEntity.data.isCustom as boolean,
      dateAdded: updatedEntity.createdAt,
      dateStarted: updatedEntity.data.dateStarted as number | undefined,
      dateCompleted: updatedEntity.data.dateCompleted as number | undefined,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: book };
  } catch (error) {
    console.error("Failed to update book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteBook(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/books");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete book:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getBooks(filters?: BookFilters): Promise<Book[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType("book", false)) as BookEntity[];

    let books = entities.map((entity) => ({
      id: entity.id,
      title: entity.name,
      author: entity.data.author as string,
      isbn: entity.data.isbn as string | undefined,
      publisher: entity.data.publisher as string | undefined,
      publishYear: entity.data.publishYear as number | undefined,
      language: entity.data.language as string | undefined,
      pages: entity.data.pages as number | undefined,
      genre: entity.data.genre as any,
      subgenre: entity.data.subgenre as string | undefined,
      description: entity.data.description as string | undefined,
      coverImage: entity.data.coverImage as string | undefined,
      format: entity.data.format as any,
      status: entity.data.status as any,
      rating: entity.data.rating as number | undefined,
      review: entity.data.review as string | undefined,
      tags: entity.data.tags as string[] | undefined,
      series: entity.data.series as string | undefined,
      seriesPosition: entity.data.seriesPosition as number | undefined,
      currentPage: entity.data.currentPage as number | undefined,
      isFavorite: entity.data.isFavorite as boolean,
      isCustom: entity.data.isCustom as boolean,
      dateAdded: entity.createdAt,
      dateStarted: entity.data.dateStarted as number | undefined,
      dateCompleted: entity.data.dateCompleted as number | undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })) as Book[];

    // Apply filters
    if (filters) {
      if (filters.status) {
        books = books.filter((book) => book.status === filters.status);
      }
      if (filters.genre) {
        books = books.filter((book) => book.genre === filters.genre);
      }
      if (filters.format) {
        books = books.filter((book) => book.format === filters.format);
      }
      if (filters.isFavorite !== undefined) {
        books = books.filter((book) => book.isFavorite === filters.isFavorite);
      }
      if (filters.hasRating) {
        books = books.filter((book) => book.rating !== undefined);
      }
      if (filters.minRating !== undefined) {
        books = books.filter(
          (book) => (book.rating || 0) >= filters.minRating!,
        );
      }
      if (filters.search) {
        const searchQuery = filters.search.toLowerCase();
        books = books.filter(
          (book) =>
            book.title.toLowerCase().includes(searchQuery) ||
            book.author.toLowerCase().includes(searchQuery) ||
            book.description?.toLowerCase().includes(searchQuery) ||
            book.series?.toLowerCase().includes(searchQuery) ||
            book.tags?.some((tag) => tag.toLowerCase().includes(searchQuery)),
        );
      }
      if (filters.tags && filters.tags.length > 0) {
        books = books.filter((book) =>
          book.tags?.some((tag) => filters.tags!.includes(tag)),
        );
      }
    }

    return books;
  } catch (error) {
    console.error("Failed to get books:", error);
    return [];
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  "use server";
  try {
    const entity = await getEntityById(id);
    if (!entity || entity.type !== "book") {
      return null;
    }

    const bookEntity = entity as BookEntity;
    return {
      id: bookEntity.id,
      title: bookEntity.name,
      author: bookEntity.data.author as string,
      isbn: bookEntity.data.isbn as string | undefined,
      publisher: bookEntity.data.publisher as string | undefined,
      publishYear: bookEntity.data.publishYear as number | undefined,
      language: bookEntity.data.language as string | undefined,
      pages: bookEntity.data.pages as number | undefined,
      genre: bookEntity.data.genre as any,
      subgenre: bookEntity.data.subgenre as string | undefined,
      description: bookEntity.data.description as string | undefined,
      coverImage: bookEntity.data.coverImage as string | undefined,
      format: bookEntity.data.format as any,
      status: bookEntity.data.status as any,
      rating: bookEntity.data.rating as number | undefined,
      review: bookEntity.data.review as string | undefined,
      tags: bookEntity.data.tags as string[] | undefined,
      series: bookEntity.data.series as string | undefined,
      seriesPosition: bookEntity.data.seriesPosition as number | undefined,
      currentPage: bookEntity.data.currentPage as number | undefined,
      isFavorite: bookEntity.data.isFavorite as boolean,
      isCustom: bookEntity.data.isCustom as boolean,
      dateAdded: bookEntity.createdAt,
      dateStarted: bookEntity.data.dateStarted as number | undefined,
      dateCompleted: bookEntity.data.dateCompleted as number | undefined,
      createdAt: bookEntity.createdAt,
      updatedAt: bookEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get book by ID:", error);
    return null;
  }
}

export async function toggleBookFavorite(
  id: string,
): Promise<{ success: boolean; isFavorite?: boolean; error?: string }> {
  "use server";
  try {
    const book = await getBookById(id);
    if (!book) {
      return { success: false, error: "Book not found" };
    }

    await updateEntity(id, { isFavorite: !book.isFavorite });
    revalidatePath("/books");

    return { success: true, isFavorite: !book.isFavorite };
  } catch (error) {
    console.error("Failed to toggle book favorite:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateBookProgress(
  id: string,
  currentPage: number,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    const book = await getBookById(id);
    if (!book) {
      return { success: false, error: "Book not found" };
    }

    const updateData: Record<string, unknown> = { currentPage };

    // If starting to read, set status to reading
    if (book.status === "want_to_read" && currentPage > 0) {
      updateData.status = "reading";
      updateData.dateStarted = Date.now();
    }

    // If completed all pages, set status to completed
    if (book.pages && currentPage >= book.pages) {
      updateData.status = "completed";
      updateData.dateCompleted = Date.now();
    }

    await updateEntity(id, updateData);
    revalidatePath("/books");

    return { success: true };
  } catch (error) {
    console.error("Failed to update book progress:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * =====================
 * BOOK NOTE ACTIONS
 * =====================
 */

export async function createBookNote(
  input: CreateBookNoteInput,
): Promise<{ success: boolean; data?: BookNote; error?: string }> {
  "use server";
  try {
    const now = Date.now();

    const id = await createEntity<BookNoteEntity>({
      type: "bookNote",
      name:
        input.content.substring(0, 50) +
        (input.content.length > 50 ? "..." : ""),
      data: {
        bookId: input.bookId,
        content: input.content,
        page: input.page,
        chapter: input.chapter,
        type: input.type,
      },
    });

    revalidatePath("/books");

    const note: BookNote = {
      id,
      bookId: input.bookId,
      content: input.content,
      page: input.page,
      chapter: input.chapter,
      type: input.type,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: note };
  } catch (error) {
    console.error("Failed to create book note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function updateBookNote(
  input: UpdateBookNoteInput,
): Promise<{ success: boolean; data?: BookNote; error?: string }> {
  "use server";
  try {
    const entity = await getEntityById(input.id);
    if (!entity || entity.type !== "bookNote") {
      return { success: false, error: "Book note not found" };
    }

    const noteEntity = entity as BookNoteEntity;
    const now = Date.now();

    const updateData: Record<string, unknown> = {};
    if (input.content !== undefined) updateData.content = input.content;
    if (input.page !== undefined) updateData.page = input.page;
    if (input.chapter !== undefined) updateData.chapter = input.chapter;
    if (input.type !== undefined) updateData.type = input.type;

    await updateEntity(input.id, updateData);

    revalidatePath("/books");

    const updatedEntity = (await getEntityById(input.id)) as BookNoteEntity;

    const note: BookNote = {
      id: updatedEntity.id,
      bookId: updatedEntity.data.bookId as string,
      content: updatedEntity.data.content as string,
      page: updatedEntity.data.page as number | undefined,
      chapter: updatedEntity.data.chapter as string | undefined,
      type: updatedEntity.data.type as any,
      createdAt: updatedEntity.createdAt,
      updatedAt: now,
    };

    return { success: true, data: note };
  } catch (error) {
    console.error("Failed to update book note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deleteBookNote(
  id: string,
): Promise<{ success: boolean; error?: string }> {
  "use server";
  try {
    await deleteEntity(id);
    revalidatePath("/books");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete book note:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getBookNotes(bookId?: string): Promise<BookNote[]> {
  "use server";
  try {
    const entities = (await getEntitiesByType(
      "bookNote",
      false,
    )) as BookNoteEntity[];

    let notes = entities.map((entity) => ({
      id: entity.id,
      bookId: entity.data.bookId as string,
      content: entity.data.content as string,
      page: entity.data.page as number | undefined,
      chapter: entity.data.chapter as string | undefined,
      type: entity.data.type as any,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    }));

    if (bookId) {
      notes = notes.filter((note) => note.bookId === bookId);
    }

    return notes.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Failed to get book notes:", error);
    return [];
  }
}

/**
 * =====================
 * READING GOAL ACTIONS
 * =====================
 */

export async function setReadingGoal(
  year: number,
  targetBooks: number,
): Promise<{ success: boolean; data?: ReadingGoal; error?: string }> {
  "use server";
  try {
    const now = Date.now();
    const id = `reading_goal_${year}`;

    // Check if goal already exists for this year
    const existingGoal = await getReadingGoal(year);

    if (existingGoal) {
      const updateData = { targetBooks };
      await updateEntity(id, updateData);

      revalidatePath("/books");

      return {
        success: true,
        data: {
          ...existingGoal,
          targetBooks,
          updatedAt: now,
        },
      };
    }

    await createEntity<ReadingGoalEntity>({
      type: "readingGoal",
      name: `Reading Goal ${year}`,
      data: {
        year,
        targetBooks,
        completedBooks: 0,
      },
    });

    revalidatePath("/books");

    const goal: ReadingGoal = {
      id,
      year,
      targetBooks,
      completedBooks: 0,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: goal };
  } catch (error) {
    console.error("Failed to set reading goal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function getReadingGoal(
  year?: number,
): Promise<ReadingGoal | null> {
  "use server";
  try {
    const targetYear = year || new Date().getFullYear();
    const id = `reading_goal_${targetYear}`;
    const entity = await getEntityById(id);

    if (!entity || entity.type !== "readingGoal") {
      return null;
    }

    const goalEntity = entity as ReadingGoalEntity;

    // Update completed books count
    const books = await getBooks({ status: "completed" });
    const completedThisYear = books.filter((book) => {
      if (!book.dateCompleted) return false;
      return new Date(book.dateCompleted).getFullYear() === targetYear;
    }).length;

    if (goalEntity.data.completedBooks !== completedThisYear) {
      await updateEntity(id, { completedBooks: completedThisYear });
    }

    return {
      id: goalEntity.id,
      year: goalEntity.data.year as number,
      targetBooks: goalEntity.data.targetBooks as number,
      completedBooks: completedThisYear,
      createdAt: goalEntity.createdAt,
      updatedAt: goalEntity.updatedAt,
    };
  } catch (error) {
    console.error("Failed to get reading goal:", error);
    return null;
  }
}
