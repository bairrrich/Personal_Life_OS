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
import { Switch } from "@/components/ui/switch";
import {
  createRecurringTransaction,
  updateRecurringTransaction,
  type CreateRecurringTransactionInput,
} from "@/actions/recurring-transactions";
import {
  expenseCategories,
  incomeCategories,
} from "@/features/finance/categories";
import { getAccounts } from "@/actions/accounts";
import { cn } from "@/lib/utils";

interface AddRecurringTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  editData?: {
    id: string;
    amount: number;
    currency: string;
    transactionType: "income" | "expense";
    categoryId: string;
    description: string;
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    nextDate: string;
    accountId: string;
    enabled: boolean;
  } | null;
}

interface FormData {
  amount: number;
  currency: string;
  transactionType: "income" | "expense";
  categoryId: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  nextDate: string;
  accountId: string;
  enabled: boolean;
}

export function AddRecurringTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: AddRecurringTransactionDialogProps) {
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
      amount: 0,
      currency: "USD",
      transactionType: "expense",
      categoryId: "",
      description: "",
      frequency: "monthly",
      nextDate: new Date().toISOString().split("T")[0],
      accountId: "",
      enabled: true,
    },
  });

  useEffect(() => {
    if (editData) {
      form.reset({
        amount: editData.amount,
        currency: editData.currency,
        transactionType: editData.transactionType,
        categoryId: editData.categoryId,
        description: editData.description,
        frequency: editData.frequency,
        nextDate: editData.nextDate.split("T")[0],
        accountId: editData.accountId,
        enabled: editData.enabled,
      });
    } else {
      form.reset({
        amount: 0,
        currency: "USD",
        transactionType: "expense",
        categoryId: "",
        description: "",
        frequency: "monthly",
        nextDate: new Date().toISOString().split("T")[0],
        accountId: "",
        enabled: true,
      });
    }
  }, [editData, open, form]);

  const transactionType = form.watch("transactionType");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    let result;
    if (editData) {
      result = await updateRecurringTransaction({
        id: editData.id,
        ...data,
      });
    } else {
      result = await createRecurringTransaction(data);
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
  const categories =
    transactionType === "income" ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t("finance.recurring.editRecurring")
              : t("finance.recurring.addRecurring")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection */}
          <Tabs
            value={form.watch("transactionType")}
            onValueChange={(value) =>
              form.setValue("transactionType", value as "income" | "expense")
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
                  form.watch("transactionType") === "income"
                    ? {
                        backgroundColor: "#16a34a",
                        color: "white",
                      }
                    : undefined
                }
              >
                {t("finance.transactionTypes.income")}
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                className={cn(
                  "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                  "data-[state=inactive]:bg-muted/50 hover:data-[state=inactive]:bg-muted",
                )}
                style={
                  form.watch("transactionType") === "expense"
                    ? {
                        backgroundColor: "#dc2626",
                        color: "white",
                      }
                    : undefined
                }
              >
                {t("finance.transactionTypes.expense")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">{t("finance.addTransaction.amount")}</Label>
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

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="accountId">
              {t("finance.addTransaction.account")}
            </Label>
            <Select
              value={form.watch("accountId")}
              onValueChange={(value) => form.setValue("accountId", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("finance.addTransaction.selectAccount")}
                />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">
              {t("finance.addTransaction.category")}
            </Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("finance.addTransaction.selectCategory")}
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t("finance.addTransaction.description")}
            </Label>
            <Input
              id="description"
              type="text"
              placeholder={t("finance.addTransaction.descriptionPlaceholder")}
              {...form.register("description", { required: true })}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label htmlFor="frequency">
              {t("finance.recurring.frequency")}
            </Label>
            <Select
              value={form.watch("frequency")}
              onValueChange={(value) =>
                form.setValue(
                  "frequency",
                  value as "daily" | "weekly" | "monthly" | "yearly",
                )
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("finance.recurring.selectFrequency")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  {t("finance.recurring.frequencies.daily")}
                </SelectItem>
                <SelectItem value="weekly">
                  {t("finance.recurring.frequencies.weekly")}
                </SelectItem>
                <SelectItem value="monthly">
                  {t("finance.recurring.frequencies.monthly")}
                </SelectItem>
                <SelectItem value="yearly">
                  {t("finance.recurring.frequencies.yearly")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Next Date */}
          <div className="space-y-2">
            <Label htmlFor="nextDate">{t("finance.recurring.nextDate")}</Label>
            <Input
              id="nextDate"
              type="date"
              {...form.register("nextDate", { required: true })}
            />
          </div>

          {/* Enabled Switch */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">{t("finance.recurring.enabled")}</Label>
            <Switch
              id="enabled"
              checked={form.watch("enabled")}
              onCheckedChange={(value) => form.setValue("enabled", value)}
            />
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
