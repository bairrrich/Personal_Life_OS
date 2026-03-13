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
import {
  createBudget,
  updateBudget,
  type CreateBudgetInput,
} from "@/actions/budgets";
import {
  expenseCategories,
  type Category,
} from "@/features/finance/categories";

interface AddBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editData?: {
    id: string;
    amount: number;
    currency: string;
    categoryId: string;
    period: "daily" | "weekly" | "monthly" | "yearly";
  } | null;
}

interface FormData {
  amount: number;
  currency: string;
  categoryId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
}

export function AddBudgetDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: AddBudgetDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      amount: 0,
      currency: "USD",
      categoryId: "",
      period: "monthly",
    },
  });

  // Update form when editData changes
  useEffect(() => {
    if (editData) {
      form.reset({
        amount: editData.amount,
        currency: editData.currency,
        categoryId: editData.categoryId,
        period: editData.period,
      });
    } else {
      form.reset({
        amount: 0,
        currency: "USD",
        categoryId: "",
        period: "monthly",
      });
    }
  }, [editData, open, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    let result;
    if (editData) {
      result = await updateBudget({
        id: editData.id,
        amount: data.amount,
        currency: data.currency,
        categoryId: data.categoryId,
        period: data.period,
      });
    } else {
      result = await createBudget({
        amount: data.amount,
        currency: data.currency,
        categoryId: data.categoryId,
        period: data.period,
      });
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
              ? t("finance.budgets.editBudget")
              : t("finance.budgets.addBudget")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("finance.budgets.amount")}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("amount", {
                valueAsNumber: true,
                min: 0.01,
              })}
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Валюта</Label>
            <Select
              value={form.watch("currency")}
              onValueChange={(value) => form.setValue("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите валюту" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="RUB">RUB - Russian Ruble</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                <SelectItem value="KZT">KZT - Kazakhstani Tenge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">{t("finance.budgets.category")}</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("finance.budgets.selectCategory")}
                />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat: Category) => (
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

          {/* Period */}
          <div className="space-y-2">
            <Label htmlFor="period">{t("finance.budgets.period")}</Label>
            <Select
              value={form.watch("period")}
              onValueChange={(value) =>
                form.setValue(
                  "period",
                  value as "daily" | "weekly" | "monthly" | "yearly",
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.budgets.selectPeriod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  {t("finance.budgets.periods.daily")}
                </SelectItem>
                <SelectItem value="weekly">
                  {t("finance.budgets.periods.weekly")}
                </SelectItem>
                <SelectItem value="monthly">
                  {t("finance.budgets.periods.monthly")}
                </SelectItem>
                <SelectItem value="yearly">
                  {t("finance.budgets.periods.yearly")}
                </SelectItem>
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
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
