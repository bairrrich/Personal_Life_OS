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
import { foodCategories } from "@/features/nutrition/client";
import { createFood, updateFood } from "@/features/nutrition/actions";
import type { FoodItem } from "@/features/nutrition/types";

interface AddFoodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editFood?: FoodItem | null;
}

interface FormData {
  name: string;
  servingSize: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  brand: string;
  category: string;
}

export function AddFoodDialog({
  open,
  onOpenChange,
  onSuccess,
  editFood,
}: AddFoodDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      servingSize: 100,
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      brand: "",
      category: "",
    },
  });

  // Reset form when editing
  useEffect(() => {
    if (editFood) {
      form.setValue("name", editFood.name);
      form.setValue("servingSize", editFood.servingSize);
      form.setValue("calories", editFood.macros.calories);
      form.setValue("protein", editFood.macros.protein);
      form.setValue("fat", editFood.macros.fat);
      form.setValue("carbs", editFood.macros.carbs);
      form.setValue("fiber", editFood.macros.fiber || 0);
      form.setValue("sugar", editFood.macros.sugar || 0);
      form.setValue("brand", editFood.brand || "");
      form.setValue("category", "");
    } else {
      form.reset();
    }
  }, [editFood, open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = editFood
      ? await updateFood(editFood.id, {
          name: data.name,
          servingSize: data.servingSize,
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          fiber: data.fiber,
          sugar: data.sugar,
          brand: data.brand,
        })
      : await createFood({
          name: data.name,
          servingSize: data.servingSize,
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          fiber: data.fiber,
          sugar: data.sugar,
          brand: data.brand,
          category: data.category,
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editFood ? t("nutrition.editFood") : t("nutrition.addCustomFood")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("nutrition.categories.other")} *</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("nutrition.foods.chicken_breast")}
              {...form.register("name", { required: true })}
            />
          </div>

          {/* Serving Size */}
          <div className="space-y-2">
            <Label htmlFor="servingSize">
              {t("nutrition.servingSize")} (g) *
            </Label>
            <Input
              id="servingSize"
              type="number"
              min="1"
              defaultValue={100}
              {...form.register("servingSize", {
                valueAsNumber: true,
                min: 1,
                required: true,
              })}
            />
            <p className="text-xs text-muted-foreground">
              {t("nutrition.servingSizeHint")}
            </p>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="calories">{t("nutrition.calories")} *</Label>
              <Input
                id="calories"
                type="number"
                min="0"
                {...form.register("calories", {
                  valueAsNumber: true,
                  min: 0,
                  required: true,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protein">{t("nutrition.protein")} (g) *</Label>
              <Input
                id="protein"
                type="number"
                min="0"
                step="0.1"
                {...form.register("protein", {
                  valueAsNumber: true,
                  min: 0,
                  required: true,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat">{t("nutrition.fat")} (g) *</Label>
              <Input
                id="fat"
                type="number"
                min="0"
                step="0.1"
                {...form.register("fat", {
                  valueAsNumber: true,
                  min: 0,
                  required: true,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs">{t("nutrition.carbs")} (g) *</Label>
              <Input
                id="carbs"
                type="number"
                min="0"
                step="0.1"
                {...form.register("carbs", {
                  valueAsNumber: true,
                  min: 0,
                  required: true,
                })}
              />
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fiber">{t("nutrition.fiber")} (g)</Label>
              <Input
                id="fiber"
                type="number"
                min="0"
                step="0.1"
                {...form.register("fiber", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sugar">{t("nutrition.sugar")} (g)</Label>
              <Input
                id="sugar"
                type="number"
                min="0"
                step="0.1"
                {...form.register("sugar", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">
              Brand ({t("common.optional") || "optional"})
            </Label>
            <Input
              id="brand"
              type="text"
              placeholder="Tyson"
              {...form.register("brand")}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {foodCategories.map((cat) => (
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
                : editFood
                  ? t("common.save")
                  : t("nutrition.addCustomFood")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
