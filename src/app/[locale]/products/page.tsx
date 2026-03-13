"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/custom-ui/glass-components";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Plus, ShoppingBasket, ShoppingCart, Tag } from "lucide-react";
import {
  ProductList,
  ProductSearch,
  ProductFiltersPanel,
  AddProductDialog,
  ShoppingListWidget,
} from "@/components/features/products";
import { useProducts, type ProductFilters } from "@/features/products/client";

export default function ProductsPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState("catalog");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({});

  const { products, loading, refresh } = useProducts(filters);

  const handleSearchChange = (query: string) => {
    setFilters((prev: ProductFilters) => ({
      ...prev,
      search: query || undefined,
    }));
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("products.title")}</h1>
            <p className="text-muted-foreground">{t("products.description")}</p>
          </div>
          {activeTab === "catalog" && (
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("products.addProduct")}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="catalog" className="flex items-center gap-2">
              <ShoppingBasket className="w-4 h-4" />
              Product Catalog
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" />
              Shopping List
            </TabsTrigger>
          </TabsList>

          {/* Catalog Tab */}
          <TabsContent value="catalog" className="space-y-4">
            {/* Search and Filters */}
            <GlassCard className="p-4 space-y-4">
              <ProductSearch
                onSearchChange={handleSearchChange}
                placeholder="Search products by name, brand, or tags..."
              />
              <ProductFiltersPanel
                filters={filters}
                onFilterChange={setFilters}
              />
            </GlassCard>

            {/* Products Grid */}
            <ProductList
              products={products}
              loading={loading}
              emptyMessage="No products found. Add your first product!"
              showActions
              columns={3}
            />
          </TabsContent>

          {/* Shopping List Tab */}
          <TabsContent value="shopping">
            <ShoppingListWidget />
          </TabsContent>
        </Tabs>

        {/* Add/Edit Product Dialog */}
        <AddProductDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSuccess={refresh}
        />
      </div>
    </AppLayout>
  );
}
