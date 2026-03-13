"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Plus, BookOpen, Target } from "lucide-react";
import {
  BookList,
  BookSearch,
  BookFiltersPanel,
  AddBookDialog,
} from "@/components/features/books";
import {
  useBooks,
  useReadingGoal,
  type BookFilters,
} from "@/features/books/client";
import { calculateBookStats } from "@/features/books/utils";
import { bookStatuses } from "@/features/books/categories";

export default function BooksPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("library");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<BookFilters>({});

  const { books, loading, refresh } = useBooks(filters);
  const { goal } = useReadingGoal();

  const stats = calculateBookStats(books, goal || undefined);

  const handleSearchChange = (query: string) => {
    setFilters((prev: BookFilters) => ({
      ...prev,
      search: query || undefined,
    }));
  };

  const currentlyReading = books.filter((b) => b.status === "reading");

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("books.title")}</h1>
            <p className="text-muted-foreground">{t("books.description")}</p>
          </div>
          {activeTab === "library" && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("books.addBook")}
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <GlassCard className="p-4">
            <div className="text-2xl font-bold">{stats.totalBooks}</div>
            <div className="text-sm text-muted-foreground">Total Books</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-2xl font-bold">{stats.totalRead}</div>
            <div className="text-sm text-muted-foreground">Read</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-2xl font-bold">{stats.totalReading}</div>
            <div className="text-sm text-muted-foreground">Reading</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="text-2xl font-bold">
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "-"}
            </div>
            <div className="text-sm text-muted-foreground">Avg Rating</div>
          </GlassCard>
        </div>

        {/* Reading Goal Progress */}
        {goal && (
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5" />
              <span className="font-medium">
                {t("books.readingGoal")}: {goal.completedBooks} /{" "}
                {goal.targetBooks}
              </span>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${Math.min(100, (goal.completedBooks / goal.targetBooks) * 100)}%`,
                }}
              />
            </div>
          </GlassCard>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="reading" className="flex items-center gap-2">
              📖 Currently Reading
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              📊 Statistics
            </TabsTrigger>
          </TabsList>

          {/* Library Tab */}
          <TabsContent value="library" className="space-y-4">
            {/* Search and Filters */}
            <GlassCard className="p-4 space-y-4">
              <BookSearch
                onSearchChange={handleSearchChange}
                placeholder="Search books by title, author, or tags..."
              />
              <BookFiltersPanel filters={filters} onFilterChange={setFilters} />
            </GlassCard>

            {/* Books Grid */}
            <BookList
              books={books}
              loading={loading}
              emptyMessage="No books found. Add your first book!"
              showActions
              columns={3}
            />
          </TabsContent>

          {/* Currently Reading Tab */}
          <TabsContent value="reading">
            {currentlyReading.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <p className="text-lg text-muted-foreground">
                  No books currently being read
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setActiveTab("library");
                    setFilters({ status: "want_to_read" });
                  }}
                >
                  Browse books to read
                </Button>
              </GlassCard>
            ) : (
              <BookList
                books={currentlyReading}
                loading={loading}
                showActions
                columns={2}
              />
            )}
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* By Status */}
              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">By Status</h3>
                <div className="space-y-2">
                  {bookStatuses.map((status) => (
                    <div key={status.id} className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <span>{status.icon}</span>
                        <span className="text-sm">{t(status.nameKey)}</span>
                      </span>
                      <span className="font-medium">
                        {stats.booksByStatus[status.id]}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Top Genres */}
              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">Top Genres</h3>
                <div className="space-y-2">
                  {Object.entries(stats.booksByGenre)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([genre, count]) => (
                      <div key={genre} className="flex justify-between">
                        <span className="text-sm capitalize">
                          {genre.replace("_", " ")}
                        </span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                </div>
              </GlassCard>

              {/* By Format */}
              <GlassCard className="p-4">
                <h3 className="font-semibold mb-3">By Format</h3>
                <div className="space-y-2">
                  {Object.entries(stats.booksByFormat).map(
                    ([format, count]) => (
                      <div key={format} className="flex justify-between">
                        <span className="text-sm capitalize">{format}</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              </GlassCard>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Book Dialog */}
        <AddBookDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refresh}
        />
      </div>
    </AppLayout>
  );
}
