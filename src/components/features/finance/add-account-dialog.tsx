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
import { createAccount, updateAccount } from "@/actions/accounts";

const ACCOUNT_ICONS = [
  { value: "💰", label: "Money" },
  { value: "🏦", label: "Bank" },
  { value: "💳", label: "Card" },
  { value: "💵", label: "Cash" },
  { value: "📱", label: "Mobile" },
  { value: "🎯", label: "Goal" },
  { value: "🔒", label: "Secure" },
  { value: "📈", label: "Investment" },
];

const ACCOUNT_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#16a34a", label: "Green" },
  { value: "#dc2626", label: "Red" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#64748b", label: "Slate" },
];

interface AddAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editData?: {
    id: string;
    name: string;
    currency: string;
    initialBalance: number;
    icon?: string;
    color?: string;
  } | null;
}

interface FormData {
  name: string;
  currency: string;
  initialBalance: number;
  icon: string;
  color: string;
}

export function AddAccountDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: AddAccountDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      currency: "USD",
      initialBalance: 0,
      icon: "💰",
      color: "#3b82f6",
    },
  });

  // Update form when editData changes
  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData.name,
        currency: editData.currency,
        initialBalance: editData.initialBalance,
        icon: editData.icon || "💰",
        color: editData.color || "#3b82f6",
      });
    } else {
      form.reset({
        name: "",
        currency: "USD",
        initialBalance: 0,
        icon: "💰",
        color: "#3b82f6",
      });
    }
  }, [editData, open, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    let result;
    if (editData) {
      result = await updateAccount({
        id: editData.id,
        name: data.name,
        currency: data.currency,
        initialBalance: data.initialBalance,
        icon: data.icon,
        color: data.color,
      });
    } else {
      result = await createAccount({
        name: data.name,
        currency: data.currency,
        initialBalance: data.initialBalance,
        icon: data.icon,
        color: data.color,
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
              ? t("finance.accounts.editAccount")
              : t("finance.accounts.addAccount")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("finance.accounts.title")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("finance.accounts.cash")}
              {...form.register("name", { required: true })}
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

          {/* Initial Balance */}
          <div className="space-y-2">
            <Label htmlFor="initialBalance">
              {t("finance.accounts.initialBalance")}
            </Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("initialBalance", {
                valueAsNumber: true,
                min: 0,
              })}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">{t("finance.accounts.icon")}</Label>
            <Select
              value={form.watch("icon")}
              onValueChange={(value) => form.setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.accounts.selectIcon")} />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_ICONS.map((icon) => (
                  <SelectItem key={icon.value} value={icon.value}>
                    <span className="flex items-center gap-2">
                      <span>{icon.value}</span>
                      <span>{icon.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color">{t("finance.accounts.color")}</Label>
            <Select
              value={form.watch("color")}
              onValueChange={(value) => form.setValue("color", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.accounts.selectColor")} />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_COLORS.map((color) => (
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
