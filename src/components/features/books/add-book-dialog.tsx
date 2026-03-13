"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createBook, updateBook } from "@/features/books/actions";
import type { Book } from "@/features/books/types";
import {
  bookGenres,
  bookStatuses,
  bookFormats,
} from "@/features/books/categories";

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editBook?: Book | null;
}

interface FormData {
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publishYear: number;
  language: string;
  pages: number;
  genre: string;
  subgenre: string;
  description: string;
  format: string;
  status: string;
  rating: number;
  series: string;
  seriesPosition: number;
  tags: string;
}

export function AddBookDialog({
  open,
  onOpenChange,
  onSuccess,
  editBook,
}: AddBookDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      publishYear: new Date().getFullYear(),
      language: "",
      pages: 0,
      genre: "",
      subgenre: "",
      description: "",
      format: "physical",
      status: "want_to_read",
      rating: 0,
      series: "",
      seriesPosition: 0,
      tags: "",
    },
  });

  // Reset form when editing
  useEffect(() => {
    if (editBook) {
      form.setValue("title", editBook.title);
      form.setValue("author", editBook.author);
      form.setValue("isbn", editBook.isbn || "");
      form.setValue("publisher", editBook.publisher || "");
      form.setValue(
        "publishYear",
        editBook.publishYear || new Date().getFullYear(),
      );
      form.setValue("language", editBook.language || "");
      form.setValue("pages", editBook.pages || 0);
      form.setValue("genre", editBook.genre);
      form.setValue("subgenre", editBook.subgenre || "");
      form.setValue("description", editBook.description || "");
      form.setValue("format", editBook.format);
      form.setValue("status", editBook.status);
      form.setValue("rating", editBook.rating || 0);
      form.setValue("series", editBook.series || "");
      form.setValue("seriesPosition", editBook.seriesPosition || 0);
      form.setValue("tags", editBook.tags?.join(", ") || "");
    } else {
      form.reset();
    }
  }, [editBook, open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = editBook
      ? await updateBook({
          id: editBook.id,
          title: data.title,
          author: data.author,
          isbn: data.isbn || undefined,
          publisher: data.publisher || undefined,
          publishYear: data.publishYear || undefined,
          language: data.language || undefined,
          pages: data.pages || undefined,
          genre: data.genre as any,
          subgenre: data.subgenre || undefined,
          description: data.description || undefined,
          format: data.format as any,
          status: data.status as any,
          rating: data.rating > 0 ? data.rating : undefined,
          series: data.series || undefined,
          seriesPosition: data.seriesPosition || undefined,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim())
            : undefined,
        })
      : await createBook({
          title: data.title,
          author: data.author,
          isbn: data.isbn || undefined,
          publisher: data.publisher || undefined,
          publishYear: data.publishYear || undefined,
          language: data.language || undefined,
          pages: data.pages || undefined,
          genre: data.genre as any,
          subgenre: data.subgenre || undefined,
          description: data.description || undefined,
          format: data.format as any,
          status: data.status as any,
          rating: data.rating > 0 ? data.rating : undefined,
          series: data.series || undefined,
          seriesPosition: data.seriesPosition || undefined,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim())
            : undefined,
        });

    setLoading(false);

    if (result.success) {
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || t("common.error"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editBook ? t("books.editBook") : t("books.addBook")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title and Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t("books.title")} *</Label>
              <Input
                id="title"
                type="text"
                placeholder={t("books.titlePlaceholder")}
                {...form.register("title", { required: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">{t("books.author")} *</Label>
              <Input
                id="author"
                type="text"
                placeholder={t("books.authorPlaceholder")}
                {...form.register("author", { required: true })}
              />
            </div>
          </div>

          {/* Genre and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">{t("books.genre")} *</Label>
              <Select
                value={form.watch("genre")}
                onValueChange={(value) => form.setValue("genre", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {bookGenres.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <span className="flex items-center gap-2">
                        <span>{g.icon}</span>
                        <span>{t(g.nameKey)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t("books.status_label")} *</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {bookStatuses.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span>{s.icon}</span>
                        <span>{t(s.nameKey)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label htmlFor="format">{t("books.format_label")} *</Label>
            <Select
              value={form.watch("format")}
              onValueChange={(value) => form.setValue("format", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {bookFormats.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    <span className="flex items-center gap-2">
                      <span>{f.icon}</span>
                      <span>{t(f.nameKey)}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ISBN and Publisher */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                type="text"
                placeholder="978-0-00-000000-0"
                {...form.register("isbn")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publisher">{t("books.publisher")}</Label>
              <Input
                id="publisher"
                type="text"
                placeholder={t("books.publisherPlaceholder")}
                {...form.register("publisher")}
              />
            </div>
          </div>

          {/* Pages and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pages">{t("books.pages")}</Label>
              <Input
                id="pages"
                type="number"
                min="0"
                {...form.register("pages", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishYear">{t("books.publishYear")}</Label>
              <Input
                id="publishYear"
                type="number"
                min="1000"
                max={new Date().getFullYear() + 1}
                {...form.register("publishYear", {
                  valueAsNumber: true,
                  min: 1000,
                })}
              />
            </div>
          </div>

          {/* Series */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="series">{t("books.series")}</Label>
              <Input
                id="series"
                type="text"
                placeholder={t("books.seriesPlaceholder")}
                {...form.register("series")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seriesPosition">#</Label>
              <Input
                id="seriesPosition"
                type="number"
                min="0"
                {...form.register("seriesPosition", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating">{t("books.rating")} (0-5)</Label>
            <Select
              value={form.watch("rating").toString()}
              onValueChange={(value) => form.setValue("rating", Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="No rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No rating</SelectItem>
                <SelectItem value="1">⭐ 1</SelectItem>
                <SelectItem value="2">⭐⭐ 2</SelectItem>
                <SelectItem value="3">⭐⭐⭐ 3</SelectItem>
                <SelectItem value="4">⭐⭐⭐⭐ 4</SelectItem>
                <SelectItem value="5">⭐⭐⭐⭐⭐ 5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("books.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("books.descriptionPlaceholder")}
              {...form.register("description")}
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t("books.tags")}</Label>
            <Input
              id="tags"
              type="text"
              placeholder="tag1, tag2, tag3"
              {...form.register("tags")}
            />
            <p className="text-xs text-muted-foreground">
              {t("books.tagsHint")}
            </p>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {/* Actions */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("common.saving")
                : editBook
                  ? t("common.save")
                  : t("books.addBook")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
