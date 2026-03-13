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
  createSavingsGoal,
  updateSavingsGoal,
  type CreateSavingsGoalInput,
} from "@/actions/savings-goals";
import { getAccounts } from "@/actions/accounts";

const GOAL_ICONS = [
  { value: "🏠", label: "House" },
  { value: "🚗", label: "Car" },
  { value: "✈️", label: "Travel" },
  { value: "💍", label: "Wedding" },
  { value: "🎓", label: "Education" },
  { value: "💻", label: "Electronics" },
  { value: "🎮", label: "Gaming" },
  { value: "💰", label: "Emergency Fund" },
  { value: "🏖️", label: "Vacation" },
  { value: "🎯", label: "Other" },
];

const GOAL_COLORS = [
  { value: "#3b82f6", label: "Blue" },
  { value: "#16a34a", label: "Green" },
  { value: "#dc2626", label: "Red" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#8b5cf6", label: "Purple" },
  { value: "#ec4899", label: "Pink" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#64748b", label: "Slate" },
];

interface AddSavingsGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editData?: {
    id: string;
    name: string;
    targetAmount: number;
    currency: string;
    deadline?: string;
    icon?: string;
    color?: string;
    accountId?: string;
  } | null;
}

interface FormData {
  name: string;
  targetAmount: number;
  currency: string;
  deadline?: string;
  icon: string;
  color: string;
  accountId?: string;
}

export function AddSavingsGoalDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: AddSavingsGoalDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const accs = await getAccounts();
        setAccounts(accs.map((a) => ({ id: a.id, name: a.name })));
      } catch (error) {
        console.error("Failed to load accounts:", error);
        setAccounts([]);
      }
    };
    loadAccounts();
  }, [open, t]);

  const form = useForm<FormData>({
    defaultValues: {
      name: "",
      targetAmount: 0,
      currency: "USD",
      deadline: "",
      icon: "🎯",
      color: "#3b82f6",
      accountId: "",
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        name: editData.name,
        targetAmount: editData.targetAmount,
        currency: editData.currency,
        deadline: editData.deadline?.split("T")[0] || "",
        icon: editData.icon || "🎯",
        color: editData.color || "#3b82f6",
        accountId: editData.accountId || "",
      });
    } else {
      form.reset({
        name: "",
        targetAmount: 0,
        currency: "USD",
        deadline: "",
        icon: "🎯",
        color: "#3b82f6",
        accountId: "",
      });
    }
  }, [editData, open, form]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    let result;
    if (editData) {
      result = await updateSavingsGoal({
        id: editData.id,
        ...data,
        deadline: data.deadline
          ? new Date(data.deadline).toISOString()
          : undefined,
        accountId: data.accountId || undefined,
      });
    } else {
      result = await createSavingsGoal({
        ...data,
        deadline: data.deadline || undefined,
        accountId: data.accountId || undefined,
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("finance.goals.editGoal")
              : t("finance.goals.addGoal")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("finance.goals.name")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("finance.goals.name")}
              {...form.register("name", { required: true })}
            />
          </div>

          {/* Target Amount */}
          <div className="space-y-2">
            <Label htmlFor="targetAmount">
              {t("finance.goals.targetAmount")}
            </Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...form.register("targetAmount", {
                valueAsNumber: true,
                min: 0.01,
              })}
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">{t("finance.currency")}</Label>
            <Select
              value={form.watch("currency")}
              onValueChange={(value) => form.setValue("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.selectCurrency")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">
                  USD - {t("finance.currencies.usd")}
                </SelectItem>
                <SelectItem value="EUR">
                  EUR - {t("finance.currencies.eur")}
                </SelectItem>
                <SelectItem value="RUB">
                  RUB - {t("finance.currencies.rub")}
                </SelectItem>
                <SelectItem value="GBP">
                  GBP - {t("finance.currencies.gbp")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">{t("finance.goals.deadline")}</Label>
            <Input id="deadline" type="date" {...form.register("deadline")} />
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="accountId">
              {t("finance.goals.linkedAccount")}
            </Label>
            <Select
              value={form.watch("accountId") || "none"}
              onValueChange={(value) =>
                form.setValue("accountId", value === "none" ? "" : value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.goals.selectAccount")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("finance.goals.none")}</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label htmlFor="icon">{t("finance.goals.icon")}</Label>
            <Select
              value={form.watch("icon")}
              onValueChange={(value) => form.setValue("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.goals.icon")} />
              </SelectTrigger>
              <SelectContent>
                {GOAL_ICONS.map((icon) => (
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
            <Label htmlFor="color">{t("finance.goals.color")}</Label>
            <Select
              value={form.watch("color")}
              onValueChange={(value) => form.setValue("color", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("finance.goals.color")} />
              </SelectTrigger>
              <SelectContent>
                {GOAL_COLORS.map((color) => (
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
