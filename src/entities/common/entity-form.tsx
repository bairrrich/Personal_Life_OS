"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getSchema } from "@/entity-engine/schema-registry";
import type { EntityType } from "@/entity-engine/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface EntityFormProps {
  type: EntityType;
  initialData?: Record<string, unknown>;
  onSubmit: (_data: Record<string, unknown>) => void | Promise<void>;
  onClose: () => void;
  open: boolean;
  title?: string;
}

export function EntityForm({
  type,
  initialData,
  onSubmit,
  onClose,
  open,
  title,
}: EntityFormProps) {
  const schema = getSchema(type);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Always call hook unconditionally
  const form = useForm({
    defaultValues: initialData || {},
  });

  if (!schema) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Unknown entity type: {type}</p>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Validate using Zod schema
    const result = schema.zodSchema.safeParse(data);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path.join(".");
        newErrors[key] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    await onSubmit(result.data as Record<string, unknown>);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title || `Add ${type}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {schema.fields.map((field) => {
            const error = errors[field.name];

            return (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="capitalize">
                  {field.label}{" "}
                  {field.required && (
                    <span className="text-destructive">*</span>
                  )}
                </Label>
                {field.type === "number" ? (
                  <Input
                    id={field.name}
                    type="number"
                    step="0.01"
                    {...form.register(field.name, {
                      valueAsNumber: true,
                      required: field.required,
                    })}
                    className={cn(error && "border-destructive")}
                  />
                ) : field.type === "boolean" ? (
                  <Input
                    id={field.name}
                    type="checkbox"
                    {...form.register(field.name, {
                      required: field.required,
                    })}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type="text"
                    {...form.register(field.name, {
                      required: field.required,
                    })}
                    className={cn(error && "border-destructive")}
                  />
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            );
          })}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
