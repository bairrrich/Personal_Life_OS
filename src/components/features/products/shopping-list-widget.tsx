"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, ShoppingCart } from "lucide-react";
import { useShoppingList } from "@/features/products/client";
import { productCategories } from "@/features/products/categories";
import { cn } from "@/lib/utils";
import type { UnitType } from "@/features/products/types";

const unitOptions: { value: UnitType; label: string }[] = [
  { value: "piece", label: "pcs" },
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "l", label: "L" },
  { value: "ml", label: "mL" },
  { value: "pack", label: "pack" },
  { value: "box", label: "box" },
  { value: "bottle", label: "bottle" },
  { value: "can", label: "can" },
];

export function ShoppingListWidget() {
  const t = useTranslations();
  const {
    items,
    loading,
    addItem,
    updateItem,
    removeItem,
    toggleChecked,
    clearChecked,
    totalEstimated,
  } = useShoppingList();

  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState<UnitType>("piece");
  const [newItemPrice, setNewItemPrice] = useState<number | undefined>();
  const [newItemCategory, setNewItemCategory] = useState<string>("none");

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    await addItem({
      name: newItemName.trim(),
      quantity: newItemQuantity,
      unit: newItemUnit,
      estimatedPrice: newItemPrice,
      category:
        newItemCategory === "none" ? undefined : (newItemCategory as any),
    });

    setNewItemName("");
    setNewItemQuantity(1);
    setNewItemUnit("piece");
    setNewItemPrice(undefined);
    setNewItemCategory("");
  };

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <CardTitle>Shopping List</CardTitle>
          </div>
          {checkedItems.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChecked}
              className="text-xs"
            >
              Clear checked ({checkedItems.length})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Item Form */}
        <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="sm:col-span-2"
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <Input
              type="number"
              placeholder="Qty"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(Number(e.target.value))}
              min="0.1"
              step="0.1"
              className="w-full"
            />
            <Select
              value={newItemUnit}
              onValueChange={(v) => setNewItemUnit(v as UnitType)}
            >
              <SelectTrigger className="w-full">
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
            <Button onClick={handleAddItem} size="icon">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Est. price"
              value={newItemPrice || ""}
              onChange={(e) =>
                setNewItemPrice(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              min="0"
              step="0.01"
            />
            <Select value={newItemCategory} onValueChange={setNewItemCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No category</SelectItem>
                {productCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>
                        {cat.nameKey.replace("products.categories.", "")}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Your shopping list is empty
          </p>
        ) : (
          <div className="space-y-2">
            {/* Unchecked Items */}
            {uncheckedItems.length > 0 && (
              <div className="space-y-2">
                {uncheckedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 border rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecked(item.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit}
                        {item.estimatedPrice && (
                          <span className="ml-2">
                            ~{item.estimatedPrice.toFixed(2)} {item.currency}
                          </span>
                        )}
                      </p>
                    </div>
                    {item.category && (
                      <Badge variant="secondary" className="text-xs">
                        {
                          productCategories.find((c) => c.id === item.category)
                            ?.icon
                        }
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Checked Items */}
            {checkedItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground font-medium">
                  Completed ({checkedItems.length})
                </p>
                {checkedItems.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 p-2 border rounded-lg opacity-60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecked(item.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate line-through">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Total */}
        {totalEstimated > 0 && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium">Estimated Total:</span>
            <span className="text-lg font-bold">
              {totalEstimated.toFixed(2)} USD
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
