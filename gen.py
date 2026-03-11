import os

# Create Finance Categories
categories_content = '''// Finance categories with subcategories

export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Category {
  id: string
  name: string
  type: TransactionType
  icon: string
  color: string
  subcategories?: Subcategory[]
}

export interface Subcategory {
  id: string
  name: string
}

export const incomeCategories: Category[] = [
  { id: 'salary', name: 'Salary', type: 'income', icon: '💰', color: 'green' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: '💻', color: 'blue' },
  { id: 'investments', name: 'Investments', type: 'income', icon: '📈', color: 'purple' },
  { id: 'gifts', name: 'Gifts', type: 'income', icon: '🎁', color: 'pink' },
  { id: 'other_income', name: 'Other Income', type: 'income', icon: '💵', color: 'gray' },
]

export const expenseCategories: Category[] = [
  { id: 'food', name: 'Food & Groceries', type: 'expense', icon: '🍔', color: 'orange',
    subcategories: [{ id: 'groceries', name: 'Groceries' }, { id: 'restaurants', name: 'Restaurants' }] },
  { id: 'transport', name: 'Transport', type: 'expense', icon: '🚗', color: 'blue',
    subcategories: [{ id: 'fuel', name: 'Fuel' }, { id: 'public', name: 'Public Transport' }] },
  { id: 'utilities', name: 'Utilities', type: 'expense', icon: '💡', color: 'yellow' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: '🎬', color: 'purple' },
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: '🛍️', color: 'pink' },
  { id: 'health', name: 'Health', type: 'expense', icon: '🏥', color: 'red' },
  { id: 'education', name: 'Education', type: 'expense', icon: '📚', color: 'indigo' },
  { id: 'subscriptions', name: 'Subscriptions', type: 'expense', icon: '📱', color: 'cyan' },
  { id: 'other_expense', name: 'Other Expense', type: 'expense', icon: '📝', color: 'gray' },
]

export function getCategoriesByType(type: TransactionType): Category[] {
  if (type === 'income') return incomeCategories
  if (type === 'expense') return expenseCategories
  return []
}
'''

os.makedirs('src/features/finance', exist_ok=True)
with open('src/features/finance/categories.ts', 'w', encoding='utf-8') as f:
    f.write(categories_content)
print('Created: src/features/finance/categories.ts')

print('\\nCategories file created!')
dialog_content = '''"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTransaction } from "@/actions/transactions"
import { cn } from "@/lib/utils"

interface AddTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface FormData {
  amount: number
  type: "income" | "expense"
  category: string
  description: string
  date: string
}

export function AddTransactionDialog({ open, onOpenChange, onSuccess }: AddTransactionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<FormData>({
    defaultValues: {
      amount: 0,
      type: "expense",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    const result = await createTransaction({
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      date: data.date,
    })

    setLoading(false)

    if (result.success) {
      form.reset()
      onSuccess?.()
      onOpenChange(false)
    } else {
      setError(result.error || "Failed to create transaction")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={form.watch("type") === "expense" ? "default" : "outline"}
              onClick={() => form.setValue("type", "expense")}
              className={cn(form.watch("type") === "expense" && "bg-red-600 hover:bg-red-700")}
            >
              Expense
            </Button>
            <Button
              type="button"
              variant={form.watch("type") === "income" ? "default" : "outline"}
              onClick={() => form.setValue("type", "income")}
              className={cn(form.watch("type") === "income" && "bg-green-600 hover:bg-green-700")}
            >
              Income
            </Button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...form.register("amount", { valueAsNumber: true, min: 0.01 })}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              type="text"
              placeholder="e.g., Grocery shopping"
              {...form.register("description", { required: true })}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              type="text"
              placeholder="e.g., food, transport, salary"
              {...form.register("category", { required: true })}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date", { required: true })}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Actions */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
'''

os.makedirs('src/features/add-transaction', exist_ok=True)
with open('src/features/add-transaction/add-transaction-dialog.tsx', 'w', encoding='utf-8') as f:
    f.write(dialog_content)
print('Created: src/features/add-transaction/add-transaction-dialog.tsx')

# Create index file
index_content = '''export { AddTransactionDialog } from "./add-transaction-dialog"
'''

with open('src/features/add-transaction/index.ts', 'w', encoding='utf-8') as f:
    f.write(index_content)
print('Created: src/features/add-transaction/index.ts')

print('\\nAddTransactionDialog created!')
finance_spec_dir = '.specify/specs/002-finance-module'
os.makedirs(finance_spec_dir, exist_ok=True)

spec_content = """# Spec: Finance Module

**Version:** 1.0.0  
**Status:** Draft  
**Created:** 2026-03-11

## 1. Цель
Интегрировать Finance модуль с Entity Engine.

## 2. Требования
- CRUD для транзакций через Entity Engine
- CRUD для счетов и категорий
- Фильтры и сортировка
- Balance widget

## 3. User Stories
- US1: Просмотр транзакций
- US2: Добавление транзакции
- US3: Управление счетами
- US4: Balance Widget

## 4. Интеграция
- transactions.ts → Entity Engine
- Finance page с фильтрами
- AddTransactionDialog
"""

plan_content = """# Plan: Finance Module

**Branch:** 002-finance-module

## Tasks
1. Обновить transactions.ts
2. Finance page
3. AddTransactionDialog
4. Balance widget
"""

tasks_content = """# Tasks: Finance Module

## Phase 1: Update Server Actions
- [ ] T010 createTransaction → Entity Engine
- [ ] T011 updateTransaction → Entity Engine
- [ ] T012 deleteTransaction → Entity Engine
- [ ] T013 getTransactions → Entity Engine

## Phase 2: Finance Page
- [ ] T020 Finance page
- [ ] T021 Фильтры
- [ ] T022 Сортировка

## Phase 3: Dialog
- [ ] T030 AddTransactionDialog
- [ ] T031 Валидация

## Phase 4: Widget
- [ ] T040 BalanceWidget
- [ ] T041 Дашборд

## Phase 5: Validation
- [ ] T050 typecheck
- [ ] T051 lint
"""

files = {
    'spec.md': spec_content,
    'plan.md': plan_content,
    'tasks.md': tasks_content,
}

for filename, content in files.items():
    filepath = os.path.join(finance_spec_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Created: {filepath}')

print('\\nFinance Module files created!')

spec_content = """# Spec: Базовая инфраструктура проекта

**Version:** 1.0.0  
**Status:** Approved  
**Created:** 2026-03-11

## 1. Цель
Создать Entity Engine с event sourcing, Schema Registry, и UI компоненты.

## 2. Требования
- Entity Engine API: createEntity, updateEntity, deleteEntity, queryEntities
- Schema Registry для 6 типов: food, transaction, account, exercise, workout, meal
- Zod валидация
- UUID с префиксами
- Soft delete
- Event sourcing

## 3. User Stories
- US1: Создание сущности
- US2: Получение сущностей  
- US3: Обновление сущности
- US4: UI отображение

## 4. Метрики
- TypeScript ошибок: 0
- Покрытие тестами: >80%
"""

plan_content = """# Implementation Plan: Базовая инфраструктура

**Branch:** 001-base-infrastructure  
**Date:** 2026-03-11

## Summary
Создание Entity Engine с event sourcing, Schema Registry, и UI компонентов.

## Technical Context
- TypeScript 5.9, Next.js 15, React 19
- Dexie.js 4 (IndexedDB)
- Zod 4, shadcn/ui, Tailwind CSS 4

## Project Structure
src/
├── entity-engine/
│   ├── types.ts
│   ├── schema-registry.ts
│   ├── validators.ts
│   ├── engine.ts
│   └── index.ts
├── entities/common/
│   ├── entity-card.tsx
│   ├── entity-table.tsx
│   └── entity-form.tsx
└── components/ui/
    ├── button.tsx, card.tsx, input.tsx
    ├── dialog.tsx, table.tsx, badge.tsx

## Constitution Check
✅ Offline-First, Entity-Driven, Event Sourcing
"""

tasks_content = """# Tasks: Базовая инфраструктура

## Phase 1: Setup
- [x] T001 Проверка зависимостей
- [x] T002 Верификация tsconfig.json

## Phase 2: Foundational
- [x] T010 types.ts
- [x] T011 schema-registry.ts
- [x] T012 validators.ts
- [x] T013 engine.ts
- [x] T014 index.ts

## Phase 3: UI Components
- [x] T020 shadcn/ui компоненты
- [x] T021 entity-card.tsx
- [x] T022 entity-table.tsx
- [x] T023 entity-form.tsx

## Phase 4: Tests
- [x] T030 engine.test.ts

## Phase 5: Validation
- [x] T040 npm run typecheck
"""

files = {
    'spec.md': spec_content,
    'plan.md': plan_content,
    'tasks.md': tasks_content,
}

for filename, content in files.items():
    filepath = os.path.join(spec_dir, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Created: {filepath}')

print('\nAll Spec-Kit files created!')

# Entity Card component
entity_card_content = '''"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BaseEntity } from "@/entity-engine/types"
import { cn } from "@/lib/utils"

interface EntityCardProps {
  entity: BaseEntity
  onClick?: () => void
  className?: string
  showType?: boolean
}

export function EntityCard({ entity, onClick, className, showType = false }: EntityCardProps) {
  const dataType = entity.type.charAt(0).toUpperCase() + entity.type.slice(1)
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-shadow hover:shadow-md",
        entity.deleted && "opacity-50",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{entity.name}</CardTitle>
          {showType && (
            <Badge variant="secondary" className="text-xs">
              {dataType}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 text-sm">
          {Object.entries(entity.data).slice(0, 4).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-muted-foreground capitalize">{key}:</span>
              <span className="font-medium">
                {typeof value === "number" && key.includes("date") 
                  ? new Date(value).toLocaleDateString()
                  : typeof value === "number"
                  ? value.toFixed(2)
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
        {entity.deleted && (
          <Badge variant="destructive" className="mt-2">Deleted</Badge>
        )}
      </CardContent>
    </Card>
  )
}
'''

# Entity Table component
entity_table_content = '''"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { BaseEntity } from "@/entity-engine/types"
import { cn } from "@/lib/utils"

interface EntityTableProps {
  entities: BaseEntity[]
  onRowClick?: (entity: BaseEntity) => void
  columns?: string[]
  className?: string
}

export function EntityTable({ 
  entities, 
  onRowClick, 
  columns,
  className 
}: EntityTableProps) {
  if (entities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No entities found
      </div>
    )
  }

  const allKeys = new Set<string>()
  entities.forEach(entity => {
    allKeys.add("name")
    Object.keys(entity.data).forEach(key => allKeys.add(key))
  })

  const displayColumns = columns || Array.from(allKeys).slice(0, 6)

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
                onRowClick && "cursor-pointer hover:bg-muted/50"
              )}
              onClick={() => onRowClick?.(entity)}
            >
              {displayColumns.map((col) => {
                let value: unknown
                if (col === "name") {
                  value = entity.name
                } else {
                  value = entity.data[col]
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
                )
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
  )
}
'''

# Entity Form component
entity_form_content = '''"use client"

import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { getSchema } from "@/entity-engine/schema-registry"
import type { BaseEntity, EntityType } from "@/entity-engine/types"
import { cn } from "@/lib/utils"

interface EntityFormProps {
  type: EntityType
  initialData?: Partial<BaseEntity["data"]>
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>
  onClose: () => void
  open: boolean
  title?: string
}

export function EntityForm({
  type,
  initialData,
  onSubmit,
  onClose,
  open,
  title,
}: EntityFormProps) {
  const schema = getSchema(type)
  
  if (!schema) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p>Unknown entity type: {type}</p>
        </DialogContent>
      </Dialog>
    )
  }

  const formSchema = schema.zodSchema as z.ZodType<Record<string, unknown>>
  
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  })

  const handleSubmit = async (data: Record<string, unknown>) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title || `Add ${type}`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {schema.fields.map((field) => (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={field.name} className="capitalize">
                {field.label} {field.required && <span className="text-destructive">*</span>}
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
                  className={cn(
                    form.formState.errors[field.name] && "border-destructive"
                  )}
                />
              ) : field.type === "boolean" ? (
                <Input
                  id={field.name}
                  type="checkbox"
                  {...form.register(field.name, { required: field.required })}
                />
              ) : (
                <Input
                  id={field.name}
                  type="text"
                  {...form.register(field.name, { required: field.required })}
                  className={cn(
                    form.formState.errors[field.name] && "border-destructive"
                  )}
                />
              )}
              {form.formState.errors[field.name] && (
                <p className="text-sm text-destructive">
                  {form.formState.errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
'''

# Index file for entities
index_content = '''// Entity UI Components
export { EntityCard } from "./entity-card"
export { EntityTable } from "./entity-table"
export { EntityForm } from "./entity-form"
'''

# Write Entity Engine files (existing)
types_content = """// Entity Engine Types for Personal Life OS

export interface BaseEntity {
  id: string
  type: string
  name: string
  data: Record<string, unknown>
  createdAt: number
  updatedAt: number
  deleted?: boolean
  tags?: string[]
}

export interface Relation {
  id: string
  fromId: string
  toId: string
  type: string
  data?: Record<string, unknown>
  createdAt: number
}

export interface SyncEvent {
  id: string
  entityId: string
  entityType: string
  eventType: "create" | "update" | "delete"
  payload: unknown
  timestamp: number
  deviceId: string
  synced: number
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type TransactionType = "income" | "expense"

export interface TransactionEntity extends BaseEntity {
  type: "transaction"
  data: {
    amount: number
    currency: string
    accountId: string
    categoryId?: string
    transactionType: TransactionType
    date: number
    note?: string
  }
}

export interface AccountEntity extends BaseEntity {
  type: "account"
  data: {
    name: string
    currency: string
    balance: number
    initialBalance: number
    icon?: string
    color?: string
  }
}

export interface FoodEntity extends BaseEntity {
  type: "food"
  data: {
    calories: number
    protein: number
    fat: number
    carbs: number
    barcode?: string
    brand?: string
  }
}

export interface MealEntity extends BaseEntity {
  type: "meal"
  data: {
    date: number
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  }
}

export interface ExerciseEntity extends BaseEntity {
  type: "exercise"
  data: {
    muscleGroup?: string
    equipment?: string
    difficulty?: "beginner" | "intermediate" | "advanced"
  }
}

export interface WorkoutEntity extends BaseEntity {
  type: "workout"
  data: {
    date: number
    duration?: number
    note?: string
  }
}

export type DomainEntity = TransactionEntity | AccountEntity | FoodEntity | MealEntity | ExerciseEntity | WorkoutEntity
export type EntityType = DomainEntity["type"]

export interface CreateEntityInput<T extends BaseEntity = BaseEntity> {
  type: string
  name: string
  data: T["data"]
  tags?: string[]
}

export interface QueryFilters {
  type?: string
  deleted?: boolean
  tags?: string[]
  createdAt?: { gte?: number; lte?: number }
  updatedAt?: { gte?: number; lte?: number }
  data?: Record<string, unknown>
}

export interface QueryOptions {
  sortBy?: "createdAt" | "updatedAt" | "name"
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
}
"""

files = {
    "src/entity-engine/types.ts": types_content,
    "src/entities/common/entity-card.tsx": entity_card_content,
    "src/entities/common/entity-table.tsx": entity_table_content,
    "src/entities/common/entity-form.tsx": entity_form_content,
    "src/entities/common/index.ts": index_content,
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created: {filepath}")

print("\\nAll Entity UI components created!")

types_content = '''// Entity Engine Types for Personal Life OS

export interface BaseEntity {
  id: string
  type: string
  name: string
  data: Record<string, unknown>
  createdAt: number
  updatedAt: number
  deleted?: boolean
  tags?: string[]
}

export interface Relation {
  id: string
  fromId: string
  toId: string
  type: string
  data?: Record<string, unknown>
  createdAt: number
}

export interface SyncEvent {
  id: string
  entityId: string
  entityType: string
  eventType: "create" | "update" | "delete"
  payload: unknown
  timestamp: number
  deviceId: string
  synced: number
}

export interface Tag {
  id: string
  name: string
  color: string
}

export type TransactionType = "income" | "expense"

export interface TransactionEntity extends BaseEntity {
  type: "transaction"
  data: {
    amount: number
    currency: string
    accountId: string
    categoryId?: string
    transactionType: TransactionType
    date: number
    note?: string
  }
}

export interface AccountEntity extends BaseEntity {
  type: "account"
  data: {
    name: string
    currency: string
    balance: number
    initialBalance: number
    icon?: string
    color?: string
  }
}

export interface FoodEntity extends BaseEntity {
  type: "food"
  data: {
    calories: number
    protein: number
    fat: number
    carbs: number
    barcode?: string
    brand?: string
  }
}

export interface MealEntity extends BaseEntity {
  type: "meal"
  data: {
    date: number
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
  }
}

export interface ExerciseEntity extends BaseEntity {
  type: "exercise"
  data: {
    muscleGroup?: string
    equipment?: string
    difficulty?: "beginner" | "intermediate" | "advanced"
  }
}

export interface WorkoutEntity extends BaseEntity {
  type: "workout"
  data: {
    date: number
    duration?: number
    note?: string
  }
}

export type DomainEntity = TransactionEntity | AccountEntity | FoodEntity | MealEntity | ExerciseEntity | WorkoutEntity
export type EntityType = DomainEntity["type"]

export interface CreateEntityInput<T extends BaseEntity = BaseEntity> {
  type: string
  name: string
  data: T["data"]
  tags?: string[]
}

export interface QueryFilters {
  type?: string
  deleted?: boolean
  tags?: string[]
  createdAt?: { gte?: number; lte?: number }
  updatedAt?: { gte?: number; lte?: number }
  data?: Record<string, unknown>
}

export interface QueryOptions {
  sortBy?: "createdAt" | "updatedAt" | "name"
  sortOrder?: "asc" | "desc"
  limit?: number
  offset?: number
}
'''

schema_content = '''// Schema Registry for Entity Engine
import { z } from "zod"

export interface EntitySchema {
  type: string
  fields: Array<{
    name: string
    type: "string" | "number" | "boolean" | "object"
    label: string
    required?: boolean
  }>
  zodSchema: z.ZodType
}

export const schemas: Record<string, EntitySchema> = {
  transaction: {
    type: "transaction",
    fields: [
      { name: "amount", type: "number", label: "Amount", required: true },
      { name: "currency", type: "string", label: "Currency", required: true },
      { name: "transactionType", type: "string", label: "Type", required: true },
      { name: "date", type: "number", label: "Date", required: true },
      { name: "note", type: "string", label: "Note" },
    ],
    zodSchema: z.object({
      amount: z.number(),
      currency: z.string(),
      transactionType: z.enum(["income", "expense"]),
      date: z.number(),
      note: z.string().optional(),
    }),
  },
  account: {
    type: "account",
    fields: [
      { name: "name", type: "string", label: "Name", required: true },
      { name: "currency", type: "string", label: "Currency", required: true },
      { name: "balance", type: "number", label: "Balance", required: true },
      { name: "initialBalance", type: "number", label: "Initial Balance", required: true },
    ],
    zodSchema: z.object({
      name: z.string(),
      currency: z.string(),
      balance: z.number(),
      initialBalance: z.number(),
    }),
  },
  food: {
    type: "food",
    fields: [
      { name: "calories", type: "number", label: "Calories", required: true },
      { name: "protein", type: "number", label: "Protein", required: true },
      { name: "fat", type: "number", label: "Fat", required: true },
      { name: "carbs", type: "number", label: "Carbs", required: true },
      { name: "barcode", type: "string", label: "Barcode" },
      { name: "brand", type: "string", label: "Brand" },
    ],
    zodSchema: z.object({
      calories: z.number(),
      protein: z.number(),
      fat: z.number(),
      carbs: z.number(),
      barcode: z.string().optional(),
      brand: z.string().optional(),
    }),
  },
  meal: {
    type: "meal",
    fields: [
      { name: "date", type: "number", label: "Date", required: true },
      { name: "mealType", type: "string", label: "Meal Type", required: true },
    ],
    zodSchema: z.object({
      date: z.number(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    }),
  },
  exercise: {
    type: "exercise",
    fields: [
      { name: "muscleGroup", type: "string", label: "Muscle Group" },
      { name: "equipment", type: "string", label: "Equipment" },
      { name: "difficulty", type: "string", label: "Difficulty" },
    ],
    zodSchema: z.object({
      muscleGroup: z.string().optional(),
      equipment: z.string().optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    }),
  },
  workout: {
    type: "workout",
    fields: [
      { name: "date", type: "number", label: "Date", required: true },
      { name: "duration", type: "number", label: "Duration" },
      { name: "note", type: "string", label: "Note" },
    ],
    zodSchema: z.object({
      date: z.number(),
      duration: z.number().optional(),
      note: z.string().optional(),
    }),
  },
}

export function getSchema(type: string): EntitySchema | undefined {
  return schemas[type]
}

export function getAllSchemas(): Record<string, EntitySchema> {
  return schemas
}
'''

validators_content = '''// Validators for Entity Engine
import { z } from "zod"
import { schemas } from "./schema-registry"
import type { BaseEntity } from "./types"

export interface ValidationResult<T = unknown> {
  success: boolean
  data?: T
  errors?: z.ZodError["errors"]
}

export function validateEntityData<T extends BaseEntity["data"]>(
  type: string,
  data: unknown
): ValidationResult<T> {
  const schema = schemas[type]
  
  if (!schema) {
    return {
      success: false,
      errors: [{ message: `Unknown entity type: ${type}`, path: [] }],
    }
  }
  
  const result = schema.zodSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data as T }
  }
  
  return { success: false, errors: result.error.errors }
}

export function validateEntity<T extends BaseEntity>(
  entity: Omit<T, "id" | "createdAt" | "updatedAt">
): ValidationResult<T> {
  const { type, name, data, tags } = entity
  
  const schema = schemas[type]
  if (!schema) {
    return {
      success: false,
      errors: [{ message: `Unknown entity type: ${type}`, path: ["type"] }],
    }
  }
  
  if (!name || typeof name !== "string") {
    return {
      success: false,
      errors: [{ message: "Name is required", path: ["name"] }],
    }
  }
  
  const dataResult = validateEntityData(type, data)
  if (!dataResult.success) return dataResult
  
  return { success: true, data: entity as T }
}
'''

engine_content = '''// Entity Engine - Core API
import { db } from "@/db/database"
import { validateEntity, validateEntityData } from "./validators"
import type { BaseEntity, SyncEvent, CreateEntityInput, QueryFilters, QueryOptions } from "./types"

function generateId(type: string): string {
  return `${type}_${crypto.randomUUID()}`
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "server"
  let deviceId = localStorage.getItem("device_id")
  if (!deviceId) {
    deviceId = `device_${crypto.randomUUID()}`
    localStorage.setItem("device_id", deviceId)
  }
  return deviceId
}

function createSyncEvent(
  entityId: string,
  entityType: string,
  eventType: "create" | "update" | "delete",
  payload: unknown
): SyncEvent {
  return {
    id: generateId("evt"),
    entityId,
    entityType,
    eventType,
    payload,
    timestamp: Date.now(),
    deviceId: getDeviceId(),
    synced: 0,
  }
}

export async function createEntity<T extends BaseEntity>(input: CreateEntityInput<T>): Promise<string> {
  const validation = validateEntity<T>({ type: input.type, name: input.name, data: input.data, tags: input.tags })
  
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(", ")}`)
  }
  
  const now = Date.now()
  const id = generateId(input.type)
  
  const entity: BaseEntity = {
    id,
    type: input.type,
    name: input.name,
    data: input.data,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    tags: input.tags || [],
  }
  
  await db.entities.add(entity)
  const event = createSyncEvent(id, input.type, "create", entity)
  await db.events.add(event)
  
  return id
}

export async function updateEntity(id: string, data: Record<string, unknown>): Promise<void> {
  const entity = await db.entities.get(id)
  if (!entity) throw new Error(`Entity ${id} not found`)
  
  const validation = validateEntityData(entity.type, { ...entity.data, ...data })
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.errors?.map((e) => e.message).join(", ")}`)
  }
  
  const now = Date.now()
  await db.entities.update(id, { data: { ...entity.data, ...data }, updatedAt: now })
  
  const event = createSyncEvent(id, entity.type, "update", { id, data: { ...entity.data, ...data } })
  await db.events.add(event)
}

export async function deleteEntity(id: string): Promise<void> {
  const entity = await db.entities.get(id)
  if (!entity) throw new Error(`Entity ${id} not found`)
  
  await db.entities.update(id, { deleted: true, updatedAt: Date.now() })
  const event = createSyncEvent(id, entity.type, "delete", { id })
  await db.events.add(event)
}

export async function getEntityById(id: string): Promise<BaseEntity | undefined> {
  return await db.entities.get(id)
}

export async function queryEntities(filters: QueryFilters, options?: QueryOptions): Promise<BaseEntity[]> {
  let collection = db.entities.toCollection()
  
  if (filters.type) collection = collection.and((e) => e.type === filters.type!)
  if (filters.deleted === false) collection = collection.and((e) => !e.deleted)
  if (filters.createdAt?.gte) collection = collection.and((e) => e.createdAt >= filters.createdAt!.gte!)
  if (filters.createdAt?.lte) collection = collection.and((e) => e.createdAt <= filters.createdAt!.lte!)
  
  const sortBy = options?.sortBy || "createdAt"
  const sortOrder = options?.sortOrder || "desc"
  
  let entities = await collection.toArray()
  entities.sort((a, b) => {
    const cmp = (a[sortBy] || 0) < (b[sortBy] || 0) ? -1 : 1
    return sortOrder === "asc" ? cmp : -cmp
  })
  
  if (options?.offset) entities = entities.slice(options.offset)
  if (options?.limit) entities = entities.slice(0, options.limit)
  
  return entities
}

export async function getEntitiesByType(type: string, includeDeleted = false): Promise<BaseEntity[]> {
  const entities = await db.entities.where("type").equals(type).toArray()
  return includeDeleted ? entities : entities.filter((e) => !e.deleted)
}
'''

index_content = '''// Entity Engine Public API
export { createEntity, updateEntity, deleteEntity, getEntityById, queryEntities, getEntitiesByType } from "./engine"
export { validateEntity, validateEntityData } from "./validators"
export { getSchema, getAllSchemas, schemas } from "./schema-registry"

export type {
  BaseEntity, Relation, SyncEvent, Tag,
  TransactionEntity, AccountEntity, FoodEntity, MealEntity, ExerciseEntity, WorkoutEntity,
  DomainEntity, EntityType, CreateEntityInput, QueryFilters, QueryOptions,
} from "./types"
'''

files = {
    "types.ts": types_content,
    "schema-registry.ts": schema_content,
    "validators.ts": validators_content,
    "engine.ts": engine_content,
    "index.ts": index_content,
}

for filename, content in files.items():
    filepath = os.path.join(base_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created: {filepath}")

# Create test file
test_content = '''// Entity Engine Tests
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest"
import { db } from "@/db/database"
import { createEntity, getEntityById, updateEntity, deleteEntity, queryEntities, getEntitiesByType } from "./engine"
import type { CreateEntityInput } from "./types"

describe("Entity Engine", () => {
  beforeAll(async () => {
    await db.open()
  })

  afterAll(async () => {
    await db.close()
  })

  beforeEach(async () => {
    await db.entities.clear()
    await db.events.clear()
  })

  describe("createEntity", () => {
    it("should create a valid transaction entity", async () => {
      const input: CreateEntityInput = {
        type: "transaction",
        name: "Coffee",
        data: {
          amount: 5,
          currency: "USD",
          accountId: "acc_1",
          transactionType: "expense",
          date: Date.now(),
        },
      }

      const id = await createEntity(input)
      expect(id).toMatch(/^transaction_/)

      const entity = await getEntityById(id)
      expect(entity).toBeDefined()
      expect(entity?.type).toBe("transaction")
      expect(entity?.name).toBe("Coffee")
    })

    it("should create a food entity", async () => {
      const input: CreateEntityInput = {
        type: "food",
        name: "Banana",
        data: {
          calories: 89,
          protein: 1.1,
          fat: 0.3,
          carbs: 23,
        },
      }

      const id = await createEntity(input)
      expect(id).toMatch(/^food_/)
    })

    it("should create sync event on entity creation", async () => {
      const input: CreateEntityInput = {
        type: "account",
        name: "Main Account",
        data: {
          name: "Main",
          currency: "USD",
          balance: 1000,
          initialBalance: 1000,
        },
      }

      await createEntity(input)

      const events = await db.events.toArray()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe("create")
    })

    it("should throw on invalid entity type", async () => {
      const input: CreateEntityInput = {
        type: "unknown",
        name: "Test",
        data: {},
      }

      await expect(createEntity(input)).rejects.toThrow("Unknown entity type")
    })
  })

  describe("updateEntity", () => {
    it("should update entity data", async () => {
      const input: CreateEntityInput = {
        type: "account",
        name: "Main Account",
        data: {
          name: "Main",
          currency: "USD",
          balance: 1000,
          initialBalance: 1000,
        },
      }

      const id = await createEntity(input)
      await updateEntity(id, { balance: 1500 })

      const entity = await getEntityById(id)
      expect(entity?.data.balance).toBe(1500)
    })

    it("should update updatedAt timestamp", async () => {
      const input: CreateEntityInput = {
        type: "food",
        name: "Apple",
        data: { calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
      }

      const id = await createEntity(input)
      const before = await getEntityById(id)

      await new Promise((resolve) => setTimeout(resolve, 10))
      await updateEntity(id, { calories: 55 })

      const after = await getEntityById(id)
      expect(after!.updatedAt).toBeGreaterThan(before!.updatedAt)
    })

    it("should throw on non-existent entity", async () => {
      await expect(updateEntity("nonexistent", {})).rejects.toThrow("not found")
    })
  })

  describe("deleteEntity", () => {
    it("should soft delete entity", async () => {
      const input: CreateEntityInput = {
        type: "workout",
        name: "Morning Run",
        data: { date: Date.now() },
      }

      const id = await createEntity(input)
      await deleteEntity(id)

      const entity = await getEntityById(id)
      expect(entity?.deleted).toBe(true)
    })

    it("should create sync event on delete", async () => {
      const input: CreateEntityInput = {
        type: "meal",
        name: "Breakfast",
        data: { date: Date.now(), mealType: "breakfast" },
      }

      const id = await createEntity(input)
      await deleteEntity(id)

      const events = await db.events.toArray()
      const deleteEvent = events.find((e) => e.eventType === "delete")
      expect(deleteEvent).toBeDefined()
    })
  })

  describe("queryEntities", () => {
    beforeEach(async () => {
      await createEntity({ type: "transaction", name: "Tx1", data: { amount: 100, currency: "USD", accountId: "acc1", transactionType: "expense", date: 1000 } })
      await createEntity({ type: "transaction", name: "Tx2", data: { amount: 200, currency: "USD", accountId: "acc1", transactionType: "income", date: 2000 } })
      await createEntity({ type: "food", name: "Food1", data: { calories: 100, protein: 10, fat: 5, carbs: 20 } })
    })

    it("should filter by type", async () => {
      const transactions = await queryEntities({ type: "transaction" })
      expect(transactions).toHaveLength(2)
      expect(transactions.every((e) => e.type === "transaction")).toBe(true)
    })

    it("should exclude deleted entities by default", async () => {
      const all = await queryEntities({ type: "transaction" })
      await deleteEntity(all[0].id)

      const remaining = await queryEntities({ type: "transaction", deleted: false })
      expect(remaining).toHaveLength(1)
    })

    it("should sort by createdAt desc by default", async () => {
      const transactions = await queryEntities({ type: "transaction" })
      expect(transactions[0].createdAt).toBeGreaterThanOrEqual(transactions[1].createdAt)
    })

    it("should apply limit and offset", async () => {
      const all = await queryEntities({ type: "transaction" })
      const limited = await queryEntities({ type: "transaction" }, { limit: 1 })
      expect(limited).toHaveLength(1)

      const offset = await queryEntities({ type: "transaction" }, { offset: 1 })
      expect(offset.length).toBeLessThan(all.length)
    })
  })

  describe("getEntitiesByType", () => {
    beforeEach(async () => {
      await createEntity({ type: "exercise", name: "Pushups", data: {} })
      await createEntity({ type: "exercise", name: "Squats", data: {} })
    })

    it("should return all entities of type", async () => {
      const exercises = await getEntitiesByType("exercise")
      expect(exercises).toHaveLength(2)
    })

    it("should exclude deleted by default", async () => {
      const all = await getEntitiesByType("exercise")
      await deleteEntity(all[0].id)

      const remaining = await getEntitiesByType("exercise")
      expect(remaining).toHaveLength(1)
    })

    it("should include deleted when requested", async () => {
      const all = await getEntitiesByType("exercise")
      await deleteEntity(all[0].id)

      const withDeleted = await getEntitiesByType("exercise", true)
      expect(withDeleted).toHaveLength(2)
    })
  })
})
'''

test_filepath = os.path.join(base_dir, "__tests__", "engine.test.ts")
with open(test_filepath, "w", encoding="utf-8") as f:
    f.write(test_content)
print(f"Created: {test_filepath}")

print("\nAll Entity Engine files created!")
