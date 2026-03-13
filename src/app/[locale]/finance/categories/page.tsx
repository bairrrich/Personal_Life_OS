"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import {
  getCategories,
  deleteCategory,
  type Category,
} from "@/actions/categories";
import { AddCategoryDialog } from "@/components/features/finance";
import {
  expenseCategories,
  incomeCategories,
} from "@/features/finance/categories";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoriesPage() {
  const t = useTranslations();
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: string;
    name: string;
    type: "income" | "expense";
    color: string;
    icon: string;
  } | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCustomCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("finance.categories.confirmDelete"))) return;
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        await loadCategories();
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory({
      ...category,
      color: category.color || "#3b82f6",
      icon: category.icon || "📁",
    });
    setShowAddDialog(true);
  };

  const handleSuccess = () => {
    loadCategories();
    setShowAddDialog(false);
    setEditingCategory(null);
  };

  const filteredCustom = customCategories.filter(
    (c) => filter === "all" || c.type === filter,
  );

  const filteredBuiltIn = [
    ...(filter === "all" || filter === "income" ? incomeCategories : []),
    ...(filter === "all" || filter === "expense" ? expenseCategories : []),
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {t("finance.categories.title")}
            </h1>
            <p className="text-muted-foreground">{t("finance.description")}</p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("finance.categories.addCategory")}
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            Все
          </Button>
          <Button
            variant={filter === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("income")}
          >
            Доходы
          </Button>
          <Button
            variant={filter === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("expense")}
          >
            Расходы
          </Button>
        </div>

        {/* Custom Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t("finance.categories.customCategories")}
          </h2>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("common.loading")}
            </div>
          ) : filteredCustom.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {t("finance.categories.noCategories")}
              </p>
            </GlassCard>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {filteredCustom.map((category) => (
                <GlassCard
                  key={category.id}
                  className="p-4 flex items-center justify-between"
                  style={{
                    borderLeftColor: category.color,
                    borderLeftWidth: "4px",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {t(`finance.categories.types.${category.type}`)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Built-in Categories */}
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {t("finance.categories.builtinCategories")}
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredBuiltIn.map((category) => (
              <GlassCard
                key={category.id}
                className="p-4 flex items-center gap-3 opacity-75"
                style={{
                  borderLeftColor: category.color,
                  borderLeftWidth: "4px",
                }}
              >
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <div className="font-medium">{t(category.nameKey)}</div>
                  <div className="text-xs text-muted-foreground">
                    {t(`finance.categories.types.${category.type}`)}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <AddCategoryDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={handleSuccess}
        editData={editingCategory}
      />
    </AppLayout>
  );
}
