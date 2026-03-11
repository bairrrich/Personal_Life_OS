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
import { createTransaction, getAccounts } from "@/actions/transactions";
import { cn } from "@/lib/utils";
import {
  expenseCategories,
  incomeCategories,
  getSubcategories,
  type Category,
} from "@/features/finance/categories";

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  accountId: string; // From account (for transfer)
  toAccount?: string; // To account (for transfer)
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddTransactionDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    { id: string; nameKey: string }[]
  >([]);
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);

  // Load accounts on mount (with defaults)
  useEffect(() => {
    const loadAccounts = async () => {
      // Default accounts
      const defaultAccounts = [
        { id: "cash", name: t("finance.accounts.cash") },
        { id: "bank_card", name: t("finance.accounts.bank_card") },
        { id: "savings", name: t("finance.accounts.savings") },
      ];

      try {
        const accs = await getAccounts();
        if (accs.length > 0) {
          setAccounts(accs.map((a) => ({ id: a.id, name: a.name })));
        } else {
          setAccounts(defaultAccounts);
        }
      } catch (error) {
        console.error("Failed to load accounts:", error);
        setAccounts(defaultAccounts);
      }
    };
    loadAccounts();
  }, [open, t]);

  const form = useForm<FormData>({
    defaultValues: {
      amount: 0,
      type: "expense", // Default to expense
      category: "",
      subcategory: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      accountId: "",
      toAccount: "",
    },
  });

  const transactionType = form.watch("type");
  const selectedCategory = form.watch("category");

  // Update subcategories when category changes
  useState(() => {
    if (selectedCategory) {
      const subs = getSubcategories(selectedCategory);
      setSelectedSubcategories(subs);
      if (
        !subs.find(
          (s: { id: string; nameKey: string }) =>
            s.id === form.watch("subcategory"),
        )
      ) {
        form.setValue("subcategory", "");
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const result = await createTransaction({
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      date: data.date,
      accountId: data.accountId,
      toAccountId: data.type === "transfer" ? data.toAccount : undefined,
    });

    setLoading(false);

    if (result.success) {
      form.reset();
      onSuccess?.();
      onOpenChange(false);
    } else {
      setError(result.error || t("finance.addTransaction.error"));
    }
  };

  const getCategories = () => {
    if (transactionType === "income") return incomeCategories;
    if (transactionType === "expense") return expenseCategories;
    return [];
  };

  const categories = getCategories();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("finance.addTransaction.title")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection - Tabs with color coding */}
          <Tabs
            value={form.watch("type")}
            onValueChange={(value) =>
              form.setValue("type", value as "income" | "expense" | "transfer")
            }
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 h-auto">
              <TabsTrigger
                value="income"
                data-color="income"
                className={cn(
                  "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                  "data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted",
                )}
                style={
                  form.watch("type") === "income"
                    ? {
                        backgroundColor: "#16a34a",
                        color: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }
                    : undefined
                }
              >
                {t("finance.transactionTypes.income")}
              </TabsTrigger>
              <TabsTrigger
                value="expense"
                data-color="expense"
                className={cn(
                  "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                  "data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted",
                )}
                style={
                  form.watch("type") === "expense"
                    ? {
                        backgroundColor: "#dc2626",
                        color: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }
                    : undefined
                }
              >
                {t("finance.transactionTypes.expense")}
              </TabsTrigger>
              <TabsTrigger
                value="transfer"
                data-color="transfer"
                className={cn(
                  "flex-1 py-2 px-4 rounded-md font-medium transition-all",
                  "data-[state=inactive]:bg-muted/50 data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:bg-muted",
                )}
                style={
                  form.watch("type") === "transfer"
                    ? {
                        backgroundColor: "#2563eb",
                        color: "white",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }
                    : undefined
                }
              >
                {t("finance.transactionTypes.transfer")}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              {t("finance.addTransaction.amount")}
            </Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              autoFocus
              className={cn(
                "w-full text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                "[&:focus-visible]:outline-none! [&:focus-visible]:ring-0! [&:focus-visible]:ring-offset-0!",
                form.watch("type") === "expense" &&
                  "border-red-500 [&:focus]:border-red-500! [&:focus-visible]:border-red-500!",
                form.watch("type") === "income" &&
                  "border-green-500 [&:focus]:border-green-500! [&:focus-visible]:border-green-500!",
                form.watch("type") === "transfer" &&
                  "border-blue-500 [&:focus]:border-blue-500! [&:focus-visible]:border-blue-500!",
              )}
              {...form.register("amount", {
                valueAsNumber: true,
                min: 0.01,
                onChange: (e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, "");
                  e.target.value = value;
                  form.setValue("amount", parseFloat(value) || 0);
                },
              })}
              onKeyDown={(e) => {
                if (["e", "E", "ArrowUp", "ArrowDown"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onWheel={(e) => {
                e.currentTarget.blur();
              }}
            />
          </div>

          {/* Account Fields - One Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* From Account */}
            <div className="space-y-2">
              <Label htmlFor="accountId" className="text-sm font-medium">
                {transactionType === "transfer"
                  ? t("finance.addTransaction.fromAccount")
                  : t("finance.addTransaction.account")}
              </Label>
              <Select
                value={form.watch("accountId")}
                onValueChange={(value) => form.setValue("accountId", value)}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue
                    placeholder={
                      transactionType === "transfer"
                        ? t("finance.addTransaction.selectFromAccount")
                        : t("finance.addTransaction.selectAccount")
                    }
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

            {/* To Account (for transfers only) */}
            {transactionType === "transfer" && (
              <div className="space-y-2">
                <Label htmlFor="toAccount" className="text-sm font-medium">
                  {t("finance.addTransaction.toAccount")}
                </Label>
                <Select
                  value={form.watch("toAccount")}
                  onValueChange={(value) => form.setValue("toAccount", value)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={t("finance.addTransaction.selectToAccount")}
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
            )}
          </div>

          {/* Category & Subcategory Row */}
          {transactionType !== "transfer" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  {t("finance.addTransaction.category")}
                </Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(value) => {
                    form.setValue("category", value);
                    form.setValue("subcategory", "");
                    setSelectedSubcategories(getSubcategories(value));
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={t("finance.addTransaction.selectCategory")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: Category) => (
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
                <Label htmlFor="subcategory" className="text-sm font-medium">
                  {t("finance.addTransaction.subcategory")}
                </Label>
                <Select
                  value={form.watch("subcategory")}
                  onValueChange={(value) => form.setValue("subcategory", value)}
                  disabled={
                    !selectedCategory || selectedSubcategories.length === 0
                  }
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue
                      placeholder={t(
                        "finance.addTransaction.selectSubcategory",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSubcategories.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {t(sub.nameKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              {t("finance.addTransaction.description")}
            </Label>
            <Input
              id="description"
              type="text"
              className="w-full"
              placeholder={t("finance.addTransaction.descriptionPlaceholder")}
              {...form.register("description", { required: true })}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium">
              {t("finance.addTransaction.date")}
            </Label>
            <Input
              id="date"
              type="date"
              className="w-full"
              {...form.register("date", { required: true })}
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
