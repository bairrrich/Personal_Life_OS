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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  createCategory,
  updateCategory,
  type CreateCategoryInput,
} from "@/actions/categories";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS = [
  { value: "📁", label: "Folder" },
  { value: "💼", label: "Briefcase" },
  { value: "🏠", label: "Home" },
  { value: "🚗", label: "Car" },
  { value: "🍔", label: "Food" },
  { value: "🛍️", label: "Shopping" },
  { value: "💊", label: "Health" },
  { value: "📚", label: "Education" },
  { value: "🎮", label: "Entertainment" },
  { value: "💡", label: "Utilities" },
  { value: "📱", label: "Phone" },
  { value: "✈️", label: "Travel" },
  { value: "🎁", label: "Gift" },
  { value: "💰", label: "Money" },
  { value: "📊", label: "Chart" },
  { value: "⭐", label: "Star" },
];

const CATEGORY_COLORS = [
  { value: "#ef4444", label: "Red" },
  { value: "#f97316", label: "Orange" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#84cc16", label: "Lime" },
  { value: "#22c55e", label: "Green" },
  { value: "#10b981", label: "Emerald" },
  { value: "#14b8a6", label: "Teal" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#3b82f6", label: "Blue" },
  { value: "#6366f1", label: "Indigo" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#d946ef", label: "Fuchsia" },
  { value: "#ec4899", label: "Pink" },
  { value: "#f43f5e", label: "Rose" },
  { value: "#64748b", label: "Slate" },
];

interface AddCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editData?: {
    id: string;
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
  } | null;
}

interface FormData {
  name: string;
  type: "income" | "expense";
  color?: string;
  icon?: string;
}

export function AddCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: AddCategoryDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      type: "expense",
      color: "#3b82f6",
      icon: "📁",
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData.name,
        type: editData.type,
        color: editData.color || "#3b82f6",
        icon: editData.icon || "📁",
      });
    } else {
      form.reset({
        name: "",
        type: "expense",
        color: "#3b82f6",
        icon: "📁",
      });
    }
  }, [editData, open, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    let result;
    if (editData) {
      result = await updateCategory({
        id: editData.id,
        ...data,
      });
    } else {
      result = await createCategory(data);
    }

    setLoading(false);

    if (result.success) {
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || t("common.error"));
    }
  };

  const isEditing = !!editData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("finance.categories.editCategory")
              : t("finance.categories.addCategory")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection */}
          <Tabs
            value={form.watch("type")}
            onValueChange={(value) =>
              form.setValue("type", value as "income" | "expense")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 gap-2 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="income"
                className={cn(
                  "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                  "data-[state=inactive]:bg-muted/50 hover:data-[state=inactive]:bg-muted",
                )}
                style={
                  form.watch("type") === "income"
                    ? {
                        backgroundColor: "#16a34a",
                        color: "white",
                      }
                    : undefined
                }
              >
                {t("finance.categories.types.income")}
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                className={cn(
                  "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                  "data-[state=inactive]:bg-muted/50 hover:data-[state=inactive]:bg-muted",
                )}
                style={
                  form.watch("type") === "expense"
                    ? {
                        backgroundColor: "#dc2626",
                        color: "white",
                      }
                    : undefined
                }
              >
                {t("finance.categories.types.expense")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("finance.categories.name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("finance.categories.name")}
              {...form.register("name", { required: true })}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">{t("finance.categories.icon")}</Label>
            <Select
              value={form.watch("icon")}
              onValueChange={(value) => form.setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.categories.selectIcon")} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {CATEGORY_ICONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{icon.value}</span>
                      <span>{icon.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">{t("finance.categories.color")}</Label>
            <Select
              value={form.watch("color")}
              onValueChange={(value) => form.setValue("color", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("finance.categories.selectColor")}
                />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {CATEGORY_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="text-sm font-medium mb-2">Предпросмотр:</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{form.watch("icon")}</span>
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: form.watch("color") }}
              />
              <span className="font-medium">
                {form.watch("name") || "Название"}
              </span>
            </div>
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
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
