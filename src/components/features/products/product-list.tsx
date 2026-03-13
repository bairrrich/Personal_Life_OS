"use client";

import type { Product } from "@/features/products/types";
import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
  onProductClick?: (product: Product) => void;
  onProductEdit?: (product: Product) => void;
  onProductDelete?: (product: Product) => void;
  onProductFavorite?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function ProductList({
  products,
  loading = false,
  emptyMessage = "No products found",
  onProductClick,
  onProductEdit,
  onProductDelete,
  onProductFavorite,
  showActions = false,
  className,
  columns = 3,
}: ProductListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-medium text-muted-foreground">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-4", gridCols[columns], className)}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
          onEdit={() => onProductEdit?.(product)}
          onDelete={() => onProductDelete?.(product)}
          onToggleFavorite={() => onProductFavorite?.(product)}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
