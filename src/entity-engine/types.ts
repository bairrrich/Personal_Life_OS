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
    fiber?: number;
    sugar?: number;
    servingSize: number;
    barcode?: string;
    brand?: string;
  };
}

export interface MealEntity extends BaseEntity {
  type: "meal";
  data: {
    date: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    foods?: Array<{
      foodId: string;
      servings: number;
      totalGrams: number;
      macros: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
        fiber?: number;
        sugar?: number;
      };
    }>;
    totalMacros?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber?: number;
      sugar?: number;
    };
    note?: string;
  };
}

export interface RecipeEntity extends BaseEntity {
  type: "recipe";
  data: {
    description?: string;
    image?: string;
    ingredients?: Array<{
      foodId: string;
      servings: number;
      totalGrams: number;
      macros: {
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
        fiber?: number;
        sugar?: number;
      };
    }>;
    totalMacros?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber?: number;
      sugar?: number;
    };
    servings: number;
    prepTime?: number;
    cookTime?: number;
    instructions?: string[];
    tags?: string[];
  };
}

export interface MealPlanEntity extends BaseEntity {
  type: "mealPlan";
  data: {
    name: string;
    weekStart: string;
    weekEnd: string;
    days: Array<{
      day:
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday";
      date: string;
      breakfast?: {
        recipeId?: string;
        mealType?: "breakfast" | "lunch" | "dinner" | "snack";
        note?: string;
      };
      lunch?: {
        recipeId?: string;
        mealType?: "breakfast" | "lunch" | "dinner" | "snack";
        note?: string;
      };
      dinner?: {
        recipeId?: string;
        mealType?: "breakfast" | "lunch" | "dinner" | "snack";
        note?: string;
      };
      snacks?: Array<{
        recipeId?: string;
        mealType?: "breakfast" | "lunch" | "dinner" | "snack";
        note?: string;
      }>;
      note?: string;
    }>;
  };
}

export interface ExerciseEntity extends BaseEntity {
  type: "exercise";
  data: {
    description?: string;
    muscleGroups?: string[];
    equipment?: string[];
    difficulty?: "beginner" | "intermediate" | "advanced";
    instructions?: string[];
    videoUrl?: string;
  };
}

export interface WorkoutSetData {
  setNumber: number;
  weight: number;
  reps: number;
  rpe?: number;
  completed: boolean;
  restTime?: number;
}

export interface WorkoutExerciseData {
  exerciseId: string;
  exerciseName: string;
  targetSets: number;
  targetReps?: number;
  targetWeight?: number;
  sets: WorkoutSetData[];
  notes?: string;
  order: number;
}

export interface WorkoutEntity extends BaseEntity {
  type: "workout";
  data: {
    date: number;
    duration?: number;
    type:
      | "strength"
      | "hypertrophy"
      | "endurance"
      | "power"
      | "hiit"
      | "cardio";
    exercises?: WorkoutExerciseData[];
    notes?: string;
    rating?: number;
    completed: boolean;
  };
}

export interface BudgetEntity extends BaseEntity {
  type: "budget";
  data: {
    amount: number;
    currency: string;
    categoryId: string;
    period: "daily" | "weekly" | "monthly" | "yearly";
    startDate: number;
    endDate?: number;
  };
}

export interface RecurringTransactionEntity extends BaseEntity {
  type: "recurringTransaction";
  data: {
    amount: number;
    currency: string;
    transactionType: "income" | "expense";
    categoryId: string;
    description: string;
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    nextDate: number;
    accountId: string;
    enabled?: boolean;
  };
}

export interface CategoryEntity extends BaseEntity {
  type: "category";
  data: {
    name: string;
    type: "income" | "expense";
    color?: string;
    icon?: string;
    parentId?: string;
    isCustom?: boolean;
  };
}

export interface SavingsGoalEntity extends BaseEntity {
  type: "savingsGoal";
  data: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    currency: string;
    deadline?: number;
    icon?: string;
    color?: string;
    accountId?: string;
  };
}

export interface ProductEntity extends BaseEntity {
  type: "product";
  data: {
    brand?: string;
    category: string;
    subcategory?: string;
    description?: string;
    image?: string;
    barcode?: string;
    defaultUnit: string;
    defaultQuantity: number;
    defaultPrice?: number;
    currency: string;
    nutritionPer100g?: {
      calories: number;
      protein: number;
      fat: number;
      carbs: number;
      fiber?: number;
      sugar?: number;
    };
    tags?: string[];
    isFavorite: boolean;
    isCustom: boolean;
  };
}

export interface PriceHistoryEntity extends BaseEntity {
  type: "priceHistory";
  data: {
    productId: string;
    price: number;
    currency: string;
    quantity: number;
    unit: string;
    store?: string;
  };
}

export interface ShoppingListItemEntity extends BaseEntity {
  type: "shoppingListItem";
  data: {
    productId?: string;
    quantity: number;
    unit: string;
    estimatedPrice?: number;
    currency: string;
    category?: string;
    checked: boolean;
    note?: string;
  };
}

export interface ShoppingListEntity extends BaseEntity {
  type: "shoppingList";
  data: {
    items?: string[]; // IDs of ShoppingListItemEntity
  };
}

export interface PurchaseEntity extends BaseEntity {
  type: "purchase";
  data: {
    items: Array<{
      productId?: string;
      name: string;
      quantity: number;
      unit: string;
      price: number;
      currency: string;
    }>;
    totalAmount: number;
    currency: string;
    store?: string;
    note?: string;
  };
}

export interface BookEntity extends BaseEntity {
  type: "book";
  data: {
    author: string;
    isbn?: string;
    publisher?: string;
    publishYear?: number;
    language?: string;
    pages?: number;
    genre: string;
    subgenre?: string;
    description?: string;
    coverImage?: string;
    format: string;
    status: string;
    rating?: number;
    review?: string;
    tags?: string[];
    series?: string;
    seriesPosition?: number;
    currentPage?: number;
    dateStarted?: number;
    dateCompleted?: number;
    isFavorite: boolean;
    isCustom: boolean;
  };
}

export interface BookNoteEntity extends BaseEntity {
  type: "bookNote";
  data: {
    bookId: string;
    content: string;
    page?: number;
    chapter?: string;
    type: "quote" | "note" | "highlight";
  };
}

export interface ReadingGoalEntity extends BaseEntity {
  type: "readingGoal";
  data: {
    year: number;
    targetBooks: number;
    completedBooks: number;
  };
}

export type DomainEntity =
  | TransactionEntity
  | AccountEntity
  | FoodEntity
  | MealEntity
  | RecipeEntity
  | MealPlanEntity
  | ExerciseEntity
  | WorkoutEntity
  | BudgetEntity
  | RecurringTransactionEntity
  | SavingsGoalEntity
  | CategoryEntity
  | ProductEntity
  | PriceHistoryEntity
  | ShoppingListItemEntity
  | ShoppingListEntity
  | PurchaseEntity
  | BookEntity
  | BookNoteEntity
  | ReadingGoalEntity;
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
