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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createHabit, updateHabit } from "@/features/habits/actions";
import type { Habit } from "@/features/habits/types";
import {
  habitCategories,
  habitFrequencies,
  weekDays,
} from "@/features/habits/categories";
import { cn } from "@/lib/utils";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editHabit?: Habit | null;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  frequency: string;
  targetValue: number;
  unit: string;
  notes: string;
  tags: string;
  reminderEnabled: boolean;
  reminderTime: string;
  specificDays: string[];
}

export function AddHabitDialog({
  open,
  onOpenChange,
  onSuccess,
  editHabit,
}: AddHabitDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "health",
      frequency: "daily",
      targetValue: 1,
      unit: "time",
      notes: "",
      tags: "",
      reminderEnabled: false,
      reminderTime: "",
      specificDays: [],
    },
  });

  useEffect(() => {
    if (editHabit) {
      form.setValue("title", editHabit.title);
      form.setValue("description", editHabit.description || "");
      form.setValue("category", editHabit.category);
      form.setValue("frequency", editHabit.frequency);
      form.setValue("targetValue", editHabit.targetValue);
      form.setValue("unit", editHabit.unit);
      form.setValue("notes", editHabit.notes || "");
      form.setValue("tags", editHabit.tags?.join(", ") || "");
      form.setValue("reminderEnabled", editHabit.reminder?.enabled || false);
      form.setValue("reminderTime", editHabit.reminder?.time || "");
      setSelectedDays(editHabit.specificDays || []);
    } else {
      form.reset();
      setSelectedDays([]);
    }
  }, [editHabit, open]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = editHabit
      ? await updateHabit({
          id: editHabit.id,
          title: data.title,
          description: data.description || undefined,
          category: data.category as any,
          frequency: data.frequency as any,
          specificDays:
            data.frequency === "specific_days"
              ? (selectedDays as any)
              : undefined,
          targetValue: data.targetValue,
          unit: data.unit,
          notes: data.notes || undefined,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim())
            : undefined,
          reminder: data.reminderEnabled
            ? { enabled: true, time: data.reminderTime || undefined }
            : { enabled: false },
        })
      : await createHabit({
          title: data.title,
          description: data.description || undefined,
          category: data.category as any,
          frequency: data.frequency as any,
          specificDays:
            data.frequency === "specific_days"
              ? (selectedDays as any)
              : undefined,
          targetValue: data.targetValue,
          unit: data.unit,
          notes: data.notes || undefined,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim())
            : undefined,
          reminder: data.reminderEnabled
            ? { enabled: true, time: data.reminderTime || undefined }
            : { enabled: false },
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editHabit ? t("habits.editHabit") : t("habits.addHabit")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("habits.title")} *</Label>
            <Input
              id="title"
              type="text"
              placeholder={t("habits.titlePlaceholder")}
              {...form.register("title", { required: true })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("habits.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("habits.descriptionPlaceholder")}
              {...form.register("description")}
              rows={2}
            />
          </div>

          {/* Category and Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t("habits.category")} *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {habitCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{t(cat.nameKey)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">{t("habits.frequency")} *</Label>
              <Select
                value={form.watch("frequency")}
                onValueChange={(value) => form.setValue("frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {habitFrequencies.map((f) => (
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
          </div>

          {/* Specific Days Selection */}
          {form.watch("frequency") === "specific_days" && (
            <div className="space-y-2 p-3 border rounded-lg">
              <Label>Select days</Label>
              <div className="flex gap-2 flex-wrap">
                {weekDays.map((day) => (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "w-10 h-10 rounded-full text-sm font-medium transition-colors",
                      selectedDays.includes(day.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                    )}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">{t("habits.targetValue")} *</Label>
              <Input
                id="targetValue"
                type="number"
                min="1"
                {...form.register("targetValue", {
                  valueAsNumber: true,
                  min: 1,
                  required: true,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">{t("habits.unit")} *</Label>
              <Input
                id="unit"
                type="text"
                placeholder="times, min, glasses..."
                {...form.register("unit", { required: true })}
              />
            </div>
          </div>

          {/* Reminder */}
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reminderEnabled"
                checked={form.watch("reminderEnabled")}
                onChange={(e) =>
                  form.setValue("reminderEnabled", e.target.checked)
                }
                className="w-4 h-4 rounded border-gray-300"
              />
              <Label htmlFor="reminderEnabled">{t("habits.reminder")}</Label>
            </div>
            {form.watch("reminderEnabled") && (
              <Input type="time" {...form.register("reminderTime")} />
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("habits.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("habits.notesPlaceholder")}
              {...form.register("notes")}
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t("habits.tags")}</Label>
            <Input
              id="tags"
              type="text"
              placeholder="tag1, tag2, tag3"
              {...form.register("tags")}
            />
            <p className="text-xs text-muted-foreground">
              {t("habits.tagsHint")}
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
                : editHabit
                  ? t("common.save")
                  : t("habits.addHabit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
