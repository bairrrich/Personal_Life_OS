// Entity Engine Types for Personal Life OS

export interface BaseEntity {
  id: string;
  type: string;
  name: string;
  data: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
  deleted?: boolean;
  tags?: string[];
}

export interface Relation {
  id: string;
  fromId: string;
  toId: string;
  type: string;
  data?: Record<string, unknown>;
  createdAt: number;
}

export interface SyncEvent {
  id: string;
  entityId: string;
  entityType: string;
  eventType: "create" | "update" | "delete";
  payload: unknown;
  timestamp: number;
  deviceId: string;
  synced: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export type TransactionType = "income" | "expense" | "transfer";

export interface TransactionEntity extends BaseEntity {
  type: "transaction";
  data: {
    amount: number;
    currency: string;
    accountId: string;
    categoryId?: string;
    subcategoryId?: string;
    transactionType: TransactionType;
    date: number;
    note?: string;
    toAccountId?: string; // For transfers
  };
}

export interface AccountEntity extends BaseEntity {
  type: "account";
  data: {
    name: string;
    currency: string;
    balance: number;
    initialBalance: number;
    icon?: string;
    color?: string;
  };
}

export interface FoodEntity extends BaseEntity {
  type: "food";
  data: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    barcode?: string;
    brand?: string;
  };
}

export interface MealEntity extends BaseEntity {
  type: "meal";
  data: {
    date: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
  };
}

export interface ExerciseEntity extends BaseEntity {
  type: "exercise";
  data: {
    muscleGroup?: string;
    equipment?: string;
    difficulty?: "beginner" | "intermediate" | "advanced";
  };
}

export interface WorkoutEntity extends BaseEntity {
  type: "workout";
  data: {
    date: number;
    duration?: number;
    note?: string;
  };
}

export type DomainEntity =
  | TransactionEntity
  | AccountEntity
  | FoodEntity
  | MealEntity
  | ExerciseEntity
  | WorkoutEntity;
export type EntityType = DomainEntity["type"];

export interface CreateEntityInput<T extends BaseEntity = BaseEntity> {
  type: string;
  name: string;
  data: T["data"];
  tags?: string[];
}

export interface QueryFilters {
  type?: string;
  deleted?: boolean;
  tags?: string[];
  createdAt?: { gte?: number; lte?: number };
  updatedAt?: { gte?: number; lte?: number };
  data?: Record<string, unknown>;
}

export interface QueryOptions {
  sortBy?: "createdAt" | "updatedAt" | "name";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
