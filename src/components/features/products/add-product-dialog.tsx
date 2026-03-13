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
import { createProduct, updateProduct } from "@/features/products/actions";
import type { Product } from "@/features/products/types";
import { productCategories } from "@/features/products/categories";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editProduct?: Product | null;
}

interface FormData {
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  barcode: string;
  defaultUnit: string;
  defaultQuantity: number;
  defaultPrice: number;
  currency: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sugar: number;
  tags: string;
}

const unitOptions = [
  { value: "piece", label: "Piece" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "l", label: "L" },
  { value: "ml", label: "mL" },
  { value: "oz", label: "oz" },
  { value: "lb", label: "lb" },
  { value: "pack", label: "Pack" },
  { value: "box", label: "Box" },
  { value: "bottle", label: "Bottle" },
  { value: "can", label: "Can" },
];

export function AddProductDialog({
  open,
  onOpenChange,
  onSuccess,
  editProduct,
}: AddProductDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNutrition, setShowNutrition] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      subcategory: "",
      description: "",
      barcode: "",
      defaultUnit: "piece",
      defaultQuantity: 1,
      defaultPrice: 0,
      currency: "USD",
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      fiber: 0,
      sugar: 0,
      tags: "",
    },
  });

  // Reset form when editing
  useEffect(() => {
    if (editProduct) {
      form.setValue("name", editProduct.name);
      form.setValue("brand", editProduct.brand || "");
      form.setValue("category", editProduct.category);
      form.setValue("subcategory", editProduct.subcategory || "");
      form.setValue("description", editProduct.description || "");
      form.setValue("barcode", editProduct.barcode || "");
      form.setValue("defaultUnit", editProduct.defaultUnit);
      form.setValue("defaultQuantity", editProduct.defaultQuantity);
      form.setValue("defaultPrice", editProduct.defaultPrice || 0);
      form.setValue("currency", editProduct.currency || "USD");
      form.setValue("tags", editProduct.tags?.join(", ") || "");

      if (editProduct.nutritionPer100g) {
        form.setValue("calories", editProduct.nutritionPer100g.calories);
        form.setValue("protein", editProduct.nutritionPer100g.protein);
        form.setValue("fat", editProduct.nutritionPer100g.fat);
        form.setValue("carbs", editProduct.nutritionPer100g.carbs);
        form.setValue("fiber", editProduct.nutritionPer100g.fiber || 0);
        form.setValue("sugar", editProduct.nutritionPer100g.sugar || 0);
        setShowNutrition(true);
      }
    } else {
      form.reset();
      setShowNutrition(false);
    }
  }, [editProduct, open]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const nutritionPer100g = showNutrition
      ? {
          calories: data.calories,
          protein: data.protein,
          fat: data.fat,
          carbs: data.carbs,
          fiber: data.fiber || undefined,
          sugar: data.sugar || undefined,
        }
      : undefined;

    const result = editProduct
      ? await updateProduct({
          id: editProduct.id,
          name: data.name,
          brand: data.brand || undefined,
          category: data.category as any,
          subcategory: data.subcategory || undefined,
          description: data.description || undefined,
          barcode: data.barcode || undefined,
          defaultUnit: data.defaultUnit as any,
          defaultQuantity: data.defaultQuantity,
          defaultPrice: data.defaultPrice || undefined,
          currency: data.currency,
          nutritionPer100g,
          tags: data.tags
            ? data.tags.split(",").map((t) => t.trim())
            : undefined,
        })
      : await createProduct({
          name: data.name,
          brand: data.brand || undefined,
          category: data.category as any,
          subcategory: data.subcategory || undefined,
          description: data.description || undefined,
          barcode: data.barcode || undefined,
          defaultUnit: data.defaultUnit as any,
          defaultQuantity: data.defaultQuantity,
          defaultPrice: data.defaultPrice || undefined,
          currency: data.currency,
          nutritionPer100g,
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
            {editProduct ? t("products.editProduct") : t("products.addProduct")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("products.name")} *</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("products.namePlaceholder")}
              {...form.register("name", { required: true })}
            />
          </div>

          {/* Brand */}
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              type="text"
              placeholder="Brand name"
              {...form.register("brand")}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">{t("products.category")} *</Label>
            <Select
              value={form.watch("category")}
              onValueChange={(value) => form.setValue("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {productCategories.map((cat) => (
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

          {/* Unit and Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultUnit">{t("products.unit")} *</Label>
              <Select
                value={form.watch("defaultUnit")}
                onValueChange={(value) => form.setValue("defaultUnit", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultQuantity">
                {t("products.quantity")} *
              </Label>
              <Input
                id="defaultQuantity"
                type="number"
                min="0.1"
                step="0.1"
                {...form.register("defaultQuantity", {
                  valueAsNumber: true,
                  min: 0.1,
                  required: true,
                })}
              />
            </div>
          </div>

          {/* Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="defaultPrice">{t("products.price")}</Label>
              <Input
                id="defaultPrice"
                type="number"
                min="0"
                step="0.01"
                {...form.register("defaultPrice", {
                  valueAsNumber: true,
                  min: 0,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">{t("products.currency")}</Label>
              <Select
                value={form.watch("currency")}
                onValueChange={(value) => form.setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="RUB">RUB</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Barcode */}
          <div className="space-y-2">
            <Label htmlFor="barcode">{t("products.barcode")}</Label>
            <Input
              id="barcode"
              type="text"
              placeholder="Barcode"
              {...form.register("barcode")}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("products.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("products.descriptionPlaceholder")}
              {...form.register("description")}
              rows={3}
            />
          </div>

          {/* Nutrition Toggle */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNutrition(!showNutrition)}
            >
              {showNutrition
                ? t("products.hideNutrition")
                : t("products.addNutrition")}
            </Button>
          </div>

          {/* Nutrition Info */}
          {showNutrition && (
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">{t("products.nutritionPer100g")}</h4>
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
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">
                    {t("nutrition.protein")} (g) *
                  </Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    {...form.register("protein", {
                      valueAsNumber: true,
                      min: 0,
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
                    })}
                  />
                </div>
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
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">{t("products.tags")}</Label>
            <Input
              id="tags"
              type="text"
              placeholder="tag1, tag2, tag3"
              {...form.register("tags")}
            />
            <p className="text-xs text-muted-foreground">
              {t("products.tagsHint")}
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
                : editProduct
                  ? t("common.save")
                  : t("products.addProduct")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
