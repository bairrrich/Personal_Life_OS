"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { BaseEntity } from "@/entity-engine/types";
import { cn } from "@/lib/utils";

interface EntityTableProps {
  entities: BaseEntity[];
  onRowClick?: (_entity: BaseEntity) => void;
  columns?: string[];
  className?: string;
}

export function EntityTable({
  entities,
  onRowClick,
  columns,
  className,
}: EntityTableProps) {
  if (entities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No entities found
      </div>
    );
  }

  const allKeys = new Set<string>();
  entities.forEach((entity) => {
    allKeys.add("name");
    Object.keys(entity.data).forEach((key) => allKeys.add(key));
  });

  const displayColumns = columns || Array.from(allKeys).slice(0, 6);

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {displayColumns.map((col) => (
              <TableHead key={col} className="capitalize">
                {col}
              </TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entities.map((entity) => (
            <TableRow
              key={entity.id}
              className={cn(
                entity.deleted && "bg-muted/50",
                onRowClick && "cursor-pointer hover:bg-muted/50",
              )}
              onClick={() => onRowClick?.(entity)}
            >
              {displayColumns.map((col) => {
                let value: unknown;
                if (col === "name") {
                  value = entity.name;
                } else {
                  value = entity.data[col];
                }

                return (
                  <TableCell key={col} className="capitalize">
                    {value === undefined ? (
                      <span className="text-muted-foreground">-</span>
                    ) : typeof value === "number" ? (
                      col.includes("date") ? (
                        new Date(value).toLocaleDateString()
                      ) : (
                        value.toFixed(2)
                      )
                    ) : (
                      String(value)
                    )}
                  </TableCell>
                );
              })}
              <TableCell>
                <div className="flex gap-2">
                  {entity.deleted ? (
                    <Badge variant="destructive">Deleted</Badge>
                  ) : (
                    <Badge variant="secondary">Active</Badge>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
