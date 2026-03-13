"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { createGoal, updateGoal } from "@/features/goals/actions";
import type { Goal } from "@/features/goals/types";
import {
  goalCategories,
  goalPriorities,
  goalTimeframes,
} from "@/features/goals/categories";
import { Plus, X } from "lucide-react";

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editGoal?: Goal | null;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  timeframe: string;
  targetType: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  notes: string;
  tags: string;
  milestones: Array<{
    title: string;
    targetValue: number;
    unit: string;
    deadline: string;
  }>;
}

export function AddGoalDialog({
  open,
  onOpenChange,
  onSuccess,
  editGoal,
}: AddGoalDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMilestones, setShowMilestones] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      title: "",
      description: "",
      category: "personal",
      priority: "medium",
      timeframe: "medium_term",
      targetType: "number",
      targetValue: 0,
      currentValue: 0,
      unit: "",
      deadline: "",
      notes: "",
      tags: "",
      milestones: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "milestones",
  });

  useEffect(() => {
    if (editGoal) {
      form.setValue("title", editGoal.title);
      form.setValue("description", editGoal.description || "");
      form.setValue("category", editGoal.category);
      form.setValue("priority", editGoal.priority);
      form.setValue("timeframe", editGoal.timeframe);
      form.setValue("targetType", editGoal.targetType);
      form.setValue("targetValue", editGoal.targetValue);
      form.setValue("currentValue", editGoal.currentValue);
      form.setValue("unit", editGoal.unit);
      form.setValue(
        "deadline",
        editGoal.deadline
          ? new Date(editGoal.deadline).toISOString().split("T")[0]
          : "",
      );
      form.setValue("notes", editGoal.notes || "");
      form.setValue("tags", editGoal.tags?.join(", ") || "");
    } else {
      form.reset();
      setShowMilestones(false);
    }
  }, [editGoal, open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const milestones = data.milestones.map((m, index) => ({
      title: m.title,
      targetValue: m.targetValue,
      unit: m.unit,
      deadline: m.deadline ? new Date(m.deadline).getTime() : undefined,
      order: index,
    }));

    const result = editGoal
      ? await updateGoal({
          id: editGoal.id,
          title: data.title,
          description: data.description || undefined,
          category: data.category as any,
          priority: data.priority as any,
          timeframe: data.timeframe as any,
          targetType: data.targetType as any,
          targetValue: data.targetValue,
          currentValue: data.currentValue,
          unit: data.unit,
          deadline: data.deadline
            ? new Date(data.deadline).getTime()
            : undefined,
          notes: data.notes || undefined,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim())
            : undefined,
        })
      : await createGoal({
          title: data.title,
          description: data.description || undefined,
          category: data.category as any,
          priority: data.priority as any,
          timeframe: data.timeframe as any,
          targetType: data.targetType as any,
          targetValue: data.targetValue,
          currentValue: data.currentValue,
          unit: data.unit,
          deadline: data.deadline
            ? new Date(data.deadline).getTime()
            : undefined,
          notes: data.notes || undefined,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim())
            : undefined,
          milestones: milestones.length > 0 ? milestones : undefined,
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
            {editGoal ? t("goals.editGoal") : t("goals.addGoal")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">{t("goals.title")} *</Label>
            <Input
              id="title"
              type="text"
              placeholder={t("goals.titlePlaceholder")}
              {...form.register("title", { required: true })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("goals.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("goals.descriptionPlaceholder")}
              {...form.register("description")}
              rows={3}
            />
          </div>

          {/* Category, Priority, Timeframe */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{t("goals.category")} *</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(value) => form.setValue("category", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((cat) => (
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
              <Label htmlFor="priority">{t("goals.priority")} *</Label>
              <Select
                value={form.watch("priority")}
                onValueChange={(value) => form.setValue("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalPriorities.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span>{p.icon}</span>
                        <span>{t(p.nameKey)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeframe">{t("goals.timeframe")} *</Label>
              <Select
                value={form.watch("timeframe")}
                onValueChange={(value) => form.setValue("timeframe", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalTimeframes.map((tf) => (
                    <SelectItem key={tf.id} value={tf.id}>
                      <span className="flex items-center gap-2">
                        <span>{tf.icon}</span>
                        <span>{t(tf.nameKey)}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Target and Current Value */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">{t("goals.targetValue")} *</Label>
              <Input
                id="targetValue"
                type="number"
                min="0"
                step="0.01"
                {...form.register("targetValue", {
                  valueAsNumber: true,
                  min: 0,
                  required: true,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentValue">{t("goals.currentValue")}</Label>
              <Input
                id="currentValue"
                type="number"
                min="0"
                step="0.01"
                {...form.register("currentValue", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">{t("goals.unit")} *</Label>
              <Input
                id="unit"
                type="text"
                placeholder="$, kg, books..."
                {...form.register("unit", { required: true })}
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">{t("goals.deadline")}</Label>
            <Input id="deadline" type="date" {...form.register("deadline")} />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("goals.notes")}</Label>
            <Textarea
              id="notes"
              placeholder={t("goals.notesPlaceholder")}
              {...form.register("notes")}
              rows={2}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t("goals.tags")}</Label>
            <Input
              id="tags"
              type="text"
              placeholder="tag1, tag2, tag3"
              {...form.register("tags")}
            />
            <p className="text-xs text-muted-foreground">
              {t("goals.tagsHint")}
            </p>
          </div>

          {/* Milestones Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowMilestones(!showMilestones)}
            >
              {showMilestones
                ? t("goals.hideMilestones")
                : t("goals.addMilestones")}
            </Button>
          </div>

          {/* Milestones */}
          {showMilestones && (
            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium">{t("goals.milestones")}</h4>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-end"
                >
                  <div className="col-span-5 space-y-2">
                    <Label>Title</Label>
                    <Input
                      {...form.register(`milestones.${index}.title` as const)}
                      placeholder="Milestone title"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Target</Label>
                    <Input
                      type="number"
                      {...form.register(
                        `milestones.${index}.targetValue` as const,
                        {
                          valueAsNumber: true,
                        },
                      )}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label>Unit</Label>
                    <Input
                      {...form.register(`milestones.${index}.unit` as const)}
                      placeholder="units"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label>Deadline</Label>
                    <Input
                      type="date"
                      {...form.register(
                        `milestones.${index}.deadline` as const,
                      )}
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ title: "", targetValue: 0, unit: "", deadline: "" })
                }
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </Button>
            </div>
          )}

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
                : editGoal
                  ? t("common.save")
                  : t("goals.addGoal")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
