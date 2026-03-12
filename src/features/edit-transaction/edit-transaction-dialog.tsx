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
import { updateTransaction, type Transaction } from "@/actions/transactions";
import { cn } from "@/lib/utils";
import {
  expenseCategories,
  incomeCategories,
  getSubcategories,
  type Category,
} from "@/features/finance/categories";

interface EditTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  transaction: Transaction | null;
}

interface FormData {
  amount: number;
  type: "income" | "expense" | "transfer";
  category: string;
  subcategory?: string;
  description: string;
  date: string;
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  transaction,
}: EditTransactionDialogProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    { id: string; nameKey: string }[]
  >([]);

  const form = useForm<FormData>({
    defaultValues: {
      amount: 0,
      type: "expense",
      category: "",
      subcategory: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Update form when transaction changes
  useEffect(() => {
    if (transaction) {
      form.reset({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        subcategory: "",
        description: transaction.description,
        date: transaction.date.split("T")[0],
      });

      // Load subcategories for the selected category
      const subs = getSubcategories(transaction.category);
      setSelectedSubcategories(subs);
    }
  }, [transaction, open, form]);

  const transactionType = form.watch("type");
  const selectedCategory = form.watch("category");

  const onSubmit = async (data: FormData) => {
    if (!transaction) return;

    setLoading(true);
    setError(null);

    const result = await updateTransaction({
      id: transaction.id,
      amount: data.amount,
      type: data.type as "income" | "expense",
      category: data.category,
      description: data.description,
      date: data.date,
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

  const getCategories = () => {
    if (transactionType === "income") return incomeCategories;
    if (transactionType === "expense") return expenseCategories;
    return [];
  };

  const categories = getCategories();

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("common.edit")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection - Read-only for edit */}
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
            <Label htmlFor="amount">{t("finance.addTransaction.amount")}</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
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

          {/* Category & Subcategory Row */}
          {transactionType !== "transfer" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">
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
                <Label htmlFor="subcategory">
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
            <Label htmlFor="description">
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
            <Label htmlFor="date">{t("finance.addTransaction.date")}</Label>
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
