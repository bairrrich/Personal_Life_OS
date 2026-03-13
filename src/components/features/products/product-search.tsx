"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

interface ProductSearchProps {
  onSearchChange?: (query: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function ProductSearch({
  onSearchChange,
  placeholder = "Search products...",
  className,
  debounceMs = 300,
}: ProductSearchProps) {
  const [value, setValue] = useState("");

  const debouncedChange = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(() => {
        onSearchChange?.(query);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [debounceMs, onSearchChange],
  );

  useEffect(() => {
    debouncedChange(value);
  }, [value, debouncedChange]);

  return (
    <div className={`relative ${className || ""}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
