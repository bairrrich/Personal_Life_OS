// Book Genres Configuration

import type { BookGenre, BookStatus, BookFormat } from "./types";

export interface BookGenreConfig {
  id: BookGenre;
  nameKey: string;
  icon: string;
  color: string;
}

export interface BookStatusConfig {
  id: BookStatus;
  nameKey: string;
  icon: string;
  color: string;
}

export interface BookFormatConfig {
  id: BookFormat;
  nameKey: string;
  icon: string;
}

export const bookGenres: BookGenreConfig[] = [
  {
    id: "fiction",
    nameKey: "books.genres.fiction",
    icon: "📚",
    color: "bg-blue-500",
  },
  {
    id: "non_fiction",
    nameKey: "books.genres.non_fiction",
    icon: "📖",
    color: "bg-green-500",
  },
  {
    id: "science_fiction",
    nameKey: "books.genres.science_fiction",
    icon: "🚀",
    color: "bg-purple-500",
  },
  {
    id: "fantasy",
    nameKey: "books.genres.fantasy",
    icon: "🐉",
    color: "bg-indigo-500",
  },
  {
    id: "mystery",
    nameKey: "books.genres.mystery",
    icon: "🔍",
    color: "bg-gray-600",
  },
  {
    id: "thriller",
    nameKey: "books.genres.thriller",
    icon: "😱",
    color: "bg-red-600",
  },
  {
    id: "romance",
    nameKey: "books.genres.romance",
    icon: "💕",
    color: "bg-pink-400",
  },
  {
    id: "horror",
    nameKey: "books.genres.horror",
    icon: "👻",
    color: "bg-gray-800",
  },
  {
    id: "biography",
    nameKey: "books.genres.biography",
    icon: "👤",
    color: "bg-amber-600",
  },
  {
    id: "history",
    nameKey: "books.genres.history",
    icon: "📜",
    color: "bg-yellow-700",
  },
  {
    id: "science",
    nameKey: "books.genres.science",
    icon: "🔬",
    color: "bg-cyan-500",
  },
  {
    id: "technology",
    nameKey: "books.genres.technology",
    icon: "💻",
    color: "bg-slate-600",
  },
  {
    id: "business",
    nameKey: "books.genres.business",
    icon: "💼",
    color: "bg-emerald-600",
  },
  {
    id: "self_help",
    nameKey: "books.genres.self_help",
    icon: "🌱",
    color: "bg-lime-500",
  },
  {
    id: "philosophy",
    nameKey: "books.genres.philosophy",
    icon: "🤔",
    color: "bg-violet-600",
  },
  {
    id: "psychology",
    nameKey: "books.genres.psychology",
    icon: "🧠",
    color: "bg-fuchsia-500",
  },
  {
    id: "art",
    nameKey: "books.genres.art",
    icon: "🎨",
    color: "bg-rose-400",
  },
  {
    id: "cooking",
    nameKey: "books.genres.cooking",
    icon: "🍳",
    color: "bg-orange-400",
  },
  {
    id: "travel",
    nameKey: "books.genres.travel",
    icon: "✈️",
    color: "bg-sky-500",
  },
  {
    id: "children",
    nameKey: "books.genres.children",
    icon: "🧸",
    color: "bg-yellow-400",
  },
  {
    id: "young_adult",
    nameKey: "books.genres.young_adult",
    icon: "📕",
    color: "bg-teal-400",
  },
  {
    id: "poetry",
    nameKey: "books.genres.poetry",
    icon: "📝",
    color: "bg-lavender-400",
  },
  {
    id: "other",
    nameKey: "books.genres.other",
    icon: "📦",
    color: "bg-slate-400",
  },
];

export const bookStatuses: BookStatusConfig[] = [
  {
    id: "want_to_read",
    nameKey: "books.status.want_to_read",
    icon: "📋",
    color: "bg-gray-400",
  },
  {
    id: "reading",
    nameKey: "books.status.reading",
    icon: "📖",
    color: "bg-blue-500",
  },
  {
    id: "completed",
    nameKey: "books.status.completed",
    icon: "✅",
    color: "bg-green-500",
  },
  {
    id: "abandoned",
    nameKey: "books.status.abandoned",
    icon: "❌",
    color: "bg-red-400",
  },
];

export const bookFormats: BookFormatConfig[] = [
  {
    id: "physical",
    nameKey: "books.format.physical",
    icon: "📕",
  },
  {
    id: "ebook",
    nameKey: "books.format.ebook",
    icon: "📱",
  },
  {
    id: "audiobook",
    nameKey: "books.format.audiobook",
    icon: "🎧",
  },
  {
    id: "pdf",
    nameKey: "books.format.pdf",
    icon: "📄",
  },
  {
    id: "other",
    nameKey: "books.format.other",
    icon: "📦",
  },
];

export const getGenreById = (id: BookGenre): BookGenreConfig | undefined => {
  return bookGenres.find((g) => g.id === id);
};

export const getStatusById = (id: BookStatus): BookStatusConfig | undefined => {
  return bookStatuses.find((s) => s.id === id);
};

export const getFormatById = (id: BookFormat): BookFormatConfig | undefined => {
  return bookFormats.find((f) => f.id === id);
};

export const getGenreIcon = (id: BookGenre): string => {
  return getGenreById(id)?.icon || "📚";
};

export const getStatusIcon = (id: BookStatus): string => {
  return getStatusById(id)?.icon || "📋";
};

export const getFormatIcon = (id: BookFormat): string => {
  return getFormatById(id)?.icon || "📕";
};

export const getGenreColor = (id: BookGenre): string => {
  return getGenreById(id)?.color || "bg-slate-400";
};

export const getStatusColor = (id: BookStatus): string => {
  return getStatusById(id)?.color || "bg-gray-400";
};
