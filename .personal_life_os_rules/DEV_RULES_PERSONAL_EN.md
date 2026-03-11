# Personal Life OS: Complete Development Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Overall System Architecture](#overall-system-architecture)
3. [Technology Stack](#technology-stack)
4. [Data Model](#data-model)
   - 4.1. Universal Entity System
   - 4.2. Graph Data Model
   - 4.3. Event Sourcing
5. [Detailed Database Schema](#detailed-database-schema)
   - 5.1. Core Tables
   - 5.2. Domain Tables (Finance, Nutrition, Workouts)
   - 5.3. Sync Tables
   - 5.4. Indexes
6. [Sync Engine](#sync-engine)
   - 6.1. Synchronization Principles
   - 6.2. Sync Queue
   - 6.3. Conflicts and Resolution
   - 6.4. Server Side (Supabase/PostgreSQL)
7. [API Integrations](#api-integrations)
   - 7.1. Integration Architecture
   - 7.2. Food APIs
   - 7.3. Exercise APIs
   - 7.4. Barcode Scanner
   - 7.5. Import Engine
8. [UI and Component Architecture](#ui-and-component-architecture)
   - 8.1. Core Principles
   - 8.2. Component Structure (shared, entities, features, widgets, pages)
   - 8.3. Navigation
   - 8.4. Dashboard and Widgets
   - 8.5. Finance, Nutrition, Workouts Screens
   - 8.6. Component Library
9. [State Management](#state-management)
   - 9.1. Live Queries (Dexie)
   - 9.2. React Hooks
   - 9.3. Global State (Zustand)
10. [Unified Entity Engine](#unified-entity-engine)
    - 10.1. Purpose and API
    - 10.2. Schema Registry
    - 10.3. Dynamic UI Based on Schemas
11. [Project Structure (Folder Layout)](#project-structure-folder-layout)
12. [Development Roadmap](#development-roadmap)
13. [Best Practices and Principles](#best-practices-and-principles)

---

## Introduction

**Personal Life OS** is an ambitious product combining in a single application the functions of:
- finance tracking (income, expenses, budgets);
- nutrition tracking (food, macronutrients, meals);
- workout management (exercises, sets, programs);
- product and supplement catalog;
- analytics and reports across all areas.

The main goal is to create an **offline-first personal life-management system** working on all devices (PWA) with synchronization capabilities. The application must be as flexible as possible so that the user enters minimal data while everything else is fetched from external APIs and auto-filled.

This guide describes a production-ready architecture including:
- a universal data model (entity system);
- a graph database with event sourcing;
- a reliable offline sync engine;
- integrations with free APIs (Open Food Facts, Wger, etc.);
- a modular UI built with Next.js, Tailwind, and shadcn/ui;
- a clear project structure scalable for years.

## Overall System Architecture

The system is built around the **offline-first** principle:
- All data is stored locally in IndexedDB (via Dexie.js).
- The user interface always works with the local database, providing instant feedback.
- When a connection to the server is available, background synchronization occurs through the **sync engine**.
- The server (Supabase / PostgreSQL) acts as a reliable storage and exchange point between devices.

### Main Layers

```
┌─────────────────┐
│      UI         │  (Next.js, React)
├─────────────────┤
│   Features      │  (business logic, commands)
├─────────────────┤
│ Entity Engine   │  (unified data API)
├─────────────────┤
│      DB         │  (Dexie + IndexedDB)
├─────────────────┤
│  Sync Engine    │  (push/pull, queue)
├─────────────────┤
│    Server       │  (Supabase, PostgreSQL)
└─────────────────┘
```

All data passes through a **unified entity engine** that hides database details and provides validation, relationships, and events.

## Technology Stack

| Component          | Technology                                                       |
| ------------------ | ---------------------------------------------------------------- |
| Frontend           | Next.js 15 (App Router), React 19, TypeScript                   |
| Styling            | Tailwind CSS, shadcn/ui (Radix UI)                               |
| Local DB           | IndexedDB + Dexie.js (with liveQuery)                            |
| ORM / Migrations   | Drizzle ORM (for SQLite if needed)                               |
| Synchronization    | Custom event-based sync engine                                   |
| Server             | Supabase (PostgreSQL, authentication, real-time)                 |
| PWA                | next-pwa, service worker, background sync                        |
| Charts             | Recharts / ECharts                                               |
| Forms & Validation | React Hook Form, Zod                                             |
| Search             | Fuse.js (fuzzy search)                                           |
| Global State       | Zustand (only for UI state, not data)                            |

## Data Model

### 4.1. Universal Entity System

Instead of many specialized tables (`foods`, `transactions`, `exercises`), a single central table **entities** is used with a flexible structure. This allows adding new entity types without database migrations.

**Basic entity structure:**

```typescript
interface BaseEntity {
  id: string;              // UUID with type prefix (food_xxx, tx_xxx)
  type: string;            // "food", "transaction", "exercise", "workout", ...
  name: string;            // display name
  data: Record<string, any>; // arbitrary fields specific to the type
  createdAt: number;       // timestamp
  updatedAt: number;
  deleted?: boolean;       // soft delete
  tags?: string[];         // tag identifiers
}
```

**Examples:**

```json
{
  "id": "food_123",
  "type": "food",
  "name": "Banana",
  "data": {
    "calories": 89,
    "protein": 1.1,
    "fat": 0.3,
    "carbs": 23,
    "brand": null
  },
  "createdAt": 1710000000
}
```

```json
{
  "id": "tx_456",
  "type": "transaction",
  "name": "Coffee",
  "data": {
    "amount": -5,
    "currency": "EUR",
    "accountId": "acc_1",
    "categoryId": "cat_food",
    "date": 1710000000,
    "note": "Morning coffee"
  }
}
```

### 4.2. Graph Data Model

Relationships between entities are stored in a separate **relations** table, turning the database into a graph.

**relations table:**

```typescript
interface Relation {
  id: string;
  fromId: string;   // source entity id
  toId: string;     // target entity id
  type: string;     // "contains", "belongs_to", "used_in", ...
  data?: Record<string, any>; // additional relation data (e.g., quantity)
  createdAt: number;
}
```

**Examples:**

- `fromId: "meal_1"`, `toId: "food_123"`, `type: "contains"`, `data: { quantity: 120, unit: "g" }`
- `fromId: "workout_1"`, `toId: "exercise_45"`, `type: "includes"`, `data: { order: 1 }`

This model allows easy querying: get all foods of a meal, all exercises of a workout, etc.

### 4.3. Event Sourcing

All data changes generate **events** stored in the `events` table. This provides:
- full change history;
- ability to roll back state;
- reliable synchronization between devices.

**Event structure:**

```typescript
interface Event {
  id: string;
  entityId: string;      // id of the changed entity
  type: string;          // "created", "updated", "deleted", "relation_added", ...
  payload: any;          // data needed to apply the event
  timestamp: number;
  deviceId: string;
  userId?: string;
  synced: boolean;       // flag for synchronization
}
```

**Example of a transaction creation event:**

```json
{
  "id": "evt_789",
  "entityId": "tx_456",
  "type": "transaction_created",
  "payload": {
    "amount": -5,
    "currency": "EUR",
    "accountId": "acc_1",
    "categoryId": "cat_food",
    "date": 1710000000,
    "note": "Morning coffee"
  },
  "timestamp": 1710000001,
  "deviceId": "device_a1b2",
  "synced": false
}
```

Applying an event to the current state (reducer) updates the corresponding entity. Periodically, **snapshots** can be created to avoid reapplying the entire history.

## Detailed Database Schema

### 5.1. Core Tables

These tables are the foundation of the system and are used by all modules.

#### `entities`
| Field      | Type      | Description                           |
| ---------- | --------  | ------------------------------------- |
| id         | string    | UUID (primary key)                    |
| type       | string    | entity type (indexed)                  |
| name       | string    | display name                           |
| data       | JSON      | all type-specific fields                |
| created_at | integer   | timestamp                              |
| updated_at | integer   | timestamp                              |
| deleted    | boolean   | soft delete                            |
| tags       | string[]  | array of tag ids (denormalized)         |

#### `relations`
| Field      | Type      | Description                           |
| ---------- | --------  | ------------------------------------- |
| id         | string    | UUID                                  |
| from_id    | string    | source entity id                      |
| to_id      | string    | target entity id                      |
| type       | string    | relation type                         |
| data       | JSON      | additional data (quantity)             |
| created_at | integer   | timestamp                              |

#### `events`
| Field      | Type      | Description                           |
| ---------- | --------  | ------------------------------------- |
| id         | string    | UUID                                  |
| entity_id  | string    | entity id                             |
| type       | string    | event type                            |
| payload    | JSON      | event data                            |
| timestamp  | integer   | creation time                         |
| device_id  | string    | device identifier                     |
| synced     | boolean   | whether sent to server                |

#### `tags`
| Field   | Type      | Description         |
| ------  | --------  | ------------------- |
| id      | string    | UUID                |
| name    | string    | tag name            |
| color   | string    | color for UI        |

#### `notes` (optional, can be stored in entity data)
| Field       | Type      | Description        |
| ----------- | --------  | ------------------ |
| id          | string    | UUID               |
| entity_id   | string    | entity id          |
| text        | string    | note text          |
| created_at  | integer   | timestamp          |

### 5.2. Domain Tables

For query optimization and strictly typed data, some modules may use separate tables referencing `entities`.

#### Finance

**`accounts`**
| Field      | Type      | Description               |
| ---------- | --------  | ------------------------- |
| id         | string    | UUID                      |
| entity_id  | string    | reference to entities.id  |
| name       | string    | account name              |
| currency   | string    | currency                  |
| balance    | number    | current balance           |

**`transactions`**
| Field         | Type      | Description                    |
| ------------- | --------  | ------------------------------ |
| id            | string    | UUID                           |
| entity_id     | string    | reference to entities.id       |
| account_id    | string    | account                        |
| category_id   | string    | category (reference to entity) |
| amount        | number    | amount                         |
| currency      | string    | currency                       |
| date          | integer   | transaction date               |
| note          | string    | note                           |

#### Nutrition

**`foods`** (can be omitted using entities only, but convenient for complex nutrients)
| Field      | Type      | Description                     |
| ---------- | --------  | ------------------------------- |
| id         | string    | UUID                            |
| entity_id  | string    | reference to entities.id        |
| calories   | number    | kcal per 100g                   |
| protein    | number    | protein                         |
| fat        | number    | fat                             |
| carbs      | number    | carbohydrates                   |
| barcode    | string    | barcode                         |

**`meals`**
| Field      | Type      | Description         |
| ---------- | --------  | ------------------- |
| id         | string    | UUID                |
| entity_id  | string    | reference to entities.id |
| date       | integer   | meal date and time  |
| type       | string    | breakfast, lunch... |

**`meal_foods`** (many-to-many with quantity)
| Field      | Type      | Description                |
| ---------- | --------  | -------------------------- |
| id         | string    | UUID                       |
| meal_id    | string    | meal id                    |
| food_id    | string    | food id                    |
| quantity   | number    | quantity                   |
| unit       | string    | unit (g, pcs)              |

#### Workouts

**`exercises`**
| Field           | Type      | Description          |
| --------------- | --------  | -------------------- |
| id              | string    | UUID                 |
| entity_id       | string    | reference to entities.id |
| muscle_group    | string    | muscle group         |
| equipment       | string    | equipment            |
| difficulty      | string    | difficulty           |

**`workouts`**
| Field      | Type      | Description        |
| ---------- | --------  | ------------------ |
| id         | string    | UUID               |
| entity_id  | string    | reference to entities.id |
| date       | integer   | workout date       |
| duration   | number    | duration (min)     |
| note       | string    | note               |

**`workout_exercises`** (workout-exercise link with order)
| Field           | Type      | Description      |
| --------------- | --------  | ---------------- |
| id              | string    | UUID             |
| workout_id      | string    | workout id       |
| exercise_id     | string    | exercise id      |
| order_index     | integer   | order            |

**`workout_sets`**
| Field                | Type      | Description             |
| -------------------- | --------  | ----------------------- |
| id                   | string    | UUID                    |
| workout_exercise_id  | string    | link                    |
| weight               | number    | weight                  |
| reps                 | integer   | repetitions             |
| time                 | number    | time (for cardio)       |
| distance             | number    | distance                |
| rest                 | number    | rest (sec)              |

### 5.3. Sync Tables

**`sync_queue`** (alternatively, use the `synced` field in `events`)
| Field      | Type      | Description                    |
| ---------- | --------  | ------------------------------ |
| id         | string    | UUID                           |
| event_id   | string    | event id                       |
| operation  | string    | "create", "update", "delete"   |
| table      | string    | target table                   |
| data       | JSON      | data to send                   |
| timestamp  | integer   | creation time                  |
| retries    | integer   | retry count                    |
| synced     | boolean   | whether sent                   |

**`sync_state`**
| Field         | Type      | Description              |
| ------------- | --------  | ------------------------ |
| device_id     | string    | device identifier        |
| last_sync     | integer   | last sync timestamp      |

**`snapshots`** (optional)
| Field       | Type      | Description             |
| ----------- | --------  | ----------------------- |
| entity_id   | string    | entity id               |
| state       | JSON      | full state              |
| version     | integer   | version number          |
| created_at  | integer   | timestamp               |

### 5.4. Indexes

For performance in Dexie.js, indexes must be added on frequently used fields:

- `entities`: `type`, `created_at`, `updated_at`, `deleted`
- `relations`: `from_id`, `to_id`, `type`
- `events`: `entity_id`, `timestamp`, `synced`
- `transactions`: `date`, `account_id`, `category_id`
- `foods`: `barcode`
- `workout_sets`: `workout_exercise_id`
- etc.

## Sync Engine

### 6.1. Synchronization Principles

Synchronization is based on events:
- Each change creates an event, which is saved locally.
- Events are marked as `synced: false`.
- A background process periodically sends unsynchronized events to the server (push).
- The server stores events and returns events from other devices (pull).
- The client applies received events to the local database.

### 6.2. Sync Queue

For reliability, a separate `sync_queue` table can be used, where each event is duplicated with retry information. However, it's simpler to use the `synced` field in the `events` table.

**Push algorithm:**

```typescript
async function pushEvents() {
  const unsynced = await db.events.where('synced').equals(false).toArray();
  if (unsynced.length === 0) return;

  try {
    const response = await fetch('/api/sync/push', {
      method: 'POST',
      body: JSON.stringify({ events: unsynced }),
    });
    if (response.ok) {
      await db.events.where('id').anyOf(unsynced.map(e => e.id)).modify({ synced: true });
    }
  } catch (error) {
    // retry on next attempt
  }
}
```

**Pull algorithm:**

```typescript
async function pullEvents() {
  const lastSync = await db.syncState.get('last_sync') || 0;
  const response = await fetch(`/api/sync/pull?since=${lastSync}`);
  const { events, timestamp } = await response.json();

  for (const event of events) {
    // avoid duplicates: if event already exists (by id), skip
    const exists = await db.events.get(event.id);
    if (!exists) {
      await db.events.add(event);
      await applyEvent(event); // apply to local entities
    }
  }
  await db.syncState.put({ key: 'last_sync', value: timestamp });
}
```

### 6.3. Conflicts and Resolution

When the same entity is modified simultaneously on different devices, a conflict occurs. A simple strategy is **last write wins** (based on timestamp). A more advanced strategy is field-level merging (e.g., if one device changed the amount and another changed the note, merge the changes).

To implement merging, the event can store only the changed field (patch) rather than the full state. Then, on the client, the event is applied as a patch.

**Example last write wins strategy:**

When receiving a creation/update event, check if an entity with that id already exists. Compare the event's `updated_at` with the entity's `updated_at`. If the event is newer, overwrite.

### 6.4. Server Side (Supabase/PostgreSQL)

On the server, a single `events` table is sufficient:

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  timestamp BIGINT NOT NULL,
  device_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_events_timestamp ON events(timestamp);
```

Endpoints:
- `POST /api/sync/push` — accepts an array of events, saves them (with duplicate check by id).
- `GET /api/sync/pull?since=timestamp` — returns all events with `timestamp > since`.

Authentication via Supabase Auth.

## API Integrations

### 7.1. Integration Architecture

All external data goes through an **adapter layer** that transforms API responses into the unified entity format.

```
External API (Open Food Facts, Wger, ...)
       ↓
    Adapter (foodAdapter, exerciseAdapter)
       ↓
  Import Engine (caching, deduplication)
       ↓
  Entity Factory (create entity in local DB)
```

### 7.2. Food APIs

**Open Food Facts** — free, open API.

- Search: `GET https://world.openfoodfacts.org/cgi/search.pl?search_terms=banana&json=1`
- By barcode: `GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json`

**Adapter:**

```typescript
export function adaptFood(apiProduct) {
  return {
    type: 'food',
    name: apiProduct.product_name || 'Unknown',
    data: {
      calories: apiProduct.nutriments['energy-kcal'] || 0,
      protein: apiProduct.nutriments.proteins || 0,
      fat: apiProduct.nutriments.fat || 0,
      carbs: apiProduct.nutriments.carbohydrates || 0,
      barcode: apiProduct.code,
      brand: apiProduct.brands,
    },
  };
}
```

### 7.3. Exercise APIs

**Wger** — free API with exercises, muscles, equipment.

- Exercise list: `GET https://wger.de/api/v2/exercise/?limit=50`

**Adapter:**

```typescript
export function adaptExercise(apiExercise) {
  return {
    type: 'exercise',
    name: apiExercise.name,
    data: {
      muscleGroup: apiExercise.muscles.map(m => m.name).join(','),
      equipment: apiExercise.equipment.map(e => e.name).join(','),
    },
  };
}
```

### 7.4. Barcode Scanner

Use the device's built-in scanner (via `navigator.mediaDevices` or a library like `quagga`). After scanning, query Open Food Facts by barcode and create the product.

### 7.5. Import Engine

To preload popular foods and basic exercises, an **Import Engine** can be implemented that, on first run, loads the top 100 foods and basic exercises. Data is cached in a `cache` table to avoid exceeding rate limits.

**Cache structure:**

| Field      | Type      | Description        |
| ---------- | --------  | ------------------ |
| key        | string    | query key          |
| result     | JSON      | API result         |
| timestamp  | integer   | save time          |

## UI and Component Architecture

### 8.1. Core Principles

- UI **never works directly with the database** — only through Entity Engine and hooks.
- Each major UI block is a **widget** that can be placed on the dashboard.
- Components are divided into layers: shared → entities → features → widgets → pages.
- **Dynamic form and table generation** based on the schema registry.

### 8.2. Component Structure (by layers)

```
src/
├── shared/
│   ├── ui/          # universal components: Button, Input, Card, Table, Dialog, etc.
│   ├── lib/         # utilities, helpers
│   ├── hooks/       # common hooks (useDebounce, useLocalStorage)
│   └── types/       # common types
├── entities/        # components representing specific entity types
│   ├── food/        # FoodCard, FoodForm, FoodTable
│   ├── transaction/ # TransactionRow, TransactionForm
│   └── ...
├── features/        # self-contained feature modules
│   ├── add-transaction/  # AddTransactionDialog, useAddTransaction
│   ├── add-food-to-meal/
│   └── ...
├── widgets/         # large blocks for the dashboard
│   ├── balance-widget/
│   ├── calories-widget/
│   └── ...
└── app/             # Next.js pages
    ├── dashboard/
    ├── finance/
    ├── nutrition/
    ├── workouts/
    └── ...
```

### 8.3. Navigation

- **Desktop**: left sidebar with icons and section names.
- **Mobile**: bottom navigation with main sections.

Sidebar content:
- Dashboard
- Finance
- Nutrition
- Workouts
- Products
- Analytics
- Search
- Settings

### 8.4. Dashboard and Widgets

The dashboard is assembled from widgets that can be configured. Widgets subscribe to data via `useLiveQuery` hooks and update automatically.

**Balance widget example:**

```tsx
import { useLiveQuery } from 'dexie-react-hooks';
import { Card, CardHeader, CardContent } from 'shared/ui/card';

export function BalanceWidget() {
  const accounts = useLiveQuery(() => db.accounts.toArray());
  const total = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

  return (
    <Card>
      <CardHeader>Total Balance</CardHeader>
      <CardContent className="text-3xl font-bold">
        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(total)}
      </CardContent>
    </Card>
  );
}
```

### 8.5. Finance, Nutrition, Workouts Screens

Each screen has a typical structure:
- header with quick actions (Add button);
- main table or list;
- optional side panel with analytics.

**Finance:**
- Balance by accounts
- Transaction list (filterable by date, category)
- "Add Transaction" button
- Expense chart by category

**Nutrition:**
- Today's calorie progress
- Meals (breakfast, lunch, dinner, snacks)
- Add food via search or scanner
- Macronutrients (protein/fat/carbs)

**Workouts:**
- "Start Workout" button
- Workout history
- Exercise library
- Workout volume chart by week

### 8.6. Component Library (shared/ui)

Use shadcn/ui as the base. Example component list:

- `Button`, `Input`, `Textarea`, `Checkbox`, `Switch`, `Select`, `Slider`
- `Dialog`, `Drawer`, `Popover`, `Tooltip`
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Table`, `TableHeader`, `TableRow`, `TableCell`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Badge`, `Avatar`
- `DropdownMenu`, `ContextMenu`
- `Progress`, `Skeleton`

## State Management

### 9.1. Live Queries (Dexie)

Dexie.js provides `liveQuery`, which automatically re-runs a query when data changes. In React, the `useLiveQuery` hook from `dexie-react-hooks` is used.

**Example:**

```tsx
import { useLiveQuery } from 'dexie-react-hooks';

export function FoodList() {
  const foods = useLiveQuery(() => db.entities.where('type').equals('food').toArray());
  return (
    <ul>
      {foods?.map(food => <li key={food.id}>{food.name}</li>)}
    </ul>
  );
}
```

### 9.2. React Hooks

For each entity type, wrapper hooks are created that use `useLiveQuery` and optionally add filtering.

```typescript
// hooks/useFoods.ts
export function useFoods(query?: string) {
  return useLiveQuery(() => {
    let collection = db.entities.where('type').equals('food');
    if (query) {
      // fuzzy search via Fuse.js can be done post-filter
    }
    return collection.toArray();
  }, [query]);
}
```

### 9.3. Global State (Zustand)

For UI state (theme, open modals, settings), Zustand is used. Entity data is not placed in global store — it lives in Dexie.

```typescript
import { create } from 'zustand';

interface UIState {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

## Unified Entity Engine

### 10.1. Purpose and API

Entity Engine is the central layer through which all data operations pass. It hides Dexie details, applies validation, creates events, and manages relationships.

**Main functions:**

- `createEntity(type, data)`
- `updateEntity(id, data)`
- `deleteEntity(id)`
- `getEntity(id)`
- `queryEntities(type, filters)`
- `createRelation(fromId, toId, type, data)`
- `deleteRelation(id)`
- `getRelations(entityId, direction = 'out')`

**Implementation example:**

```typescript
// entity-engine/engine.ts
import { db } from '@/db/dexie';
import { schemas } from './schema-registry';
import { validate } from './validators';
import { generateId } from '@/lib/ids';

export async function createEntity(type: string, data: any) {
  const schema = schemas[type];
  if (!schema) throw new Error(`Unknown entity type: ${type}`);

  validate(schema, data);

  const id = generateId(type); // e.g., food_123
  const now = Date.now();

  const entity = {
    id,
    type,
    name: data.name || '',
    data,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    tags: data.tags || [],
  };

  await db.entities.add(entity);

  // Create event
  await createEvent({
    entityId: id,
    type: 'created',
    payload: data,
  });

  return entity;
}

// similar for update, delete
```

### 10.2. Schema Registry

Each entity type is described by a schema containing fields, their types, validation rules, and UI metadata.

**Example schema for food:**

```typescript
export const foodSchema = {
  type: 'food',
  fields: [
    { name: 'name', type: 'string', label: 'Name', required: true },
    { name: 'calories', type: 'number', label: 'Calories (kcal)', required: true },
    { name: 'protein', type: 'number', label: 'Protein (g)' },
    { name: 'fat', type: 'number', label: 'Fat (g)' },
    { name: 'carbs', type: 'number', label: 'Carbs (g)' },
    { name: 'barcode', type: 'string', label: 'Barcode' },
    { name: 'brand', type: 'string', label: 'Brand' },
  ],
};
```

All schemas are collected in a registry:

```typescript
export const schemas = {
  food: foodSchema,
  exercise: exerciseSchema,
  transaction: transactionSchema,
  meal: mealSchema,
  workout: workoutSchema,
  // ...
};
```

### 10.3. Dynamic UI Based on Schemas

Using the schema registry, forms, tables, and cards can be generated automatically.

**Example EntityForm component:**

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { schemas } from '@/entity-engine/schema-registry';

export function EntityForm({ type, onSubmit, initialData }) {
  const schema = schemas[type];
  const fields = schema.fields;

  // Build Zod schema from fields
  const zodSchema = z.object(
    fields.reduce((acc, field) => {
      let zodType;
      if (field.type === 'number') zodType = z.number();
      else if (field.type === 'string') zodType = z.string();
      // ... other types
      if (field.required) zodType = zodType.min(1);
      acc[field.name] = zodType;
      return acc;
    }, {})
  );

  const form = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: initialData,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            {...form.register(field.name)}
          />
        </div>
      ))}
      <button type="submit">Save</button>
    </form>
  );
}
```

Similarly, a table (`EntityTable`) and a card (`EntityCard`) can be built.

## Project Structure (Folder Layout)

Final `src/` structure (Feature-Sliced Design + universal engine):

```
src/
├── app/                           # Next.js App Router
│   ├── (routes)/                  # page folders
│   │   ├── dashboard/
│   │   ├── finance/
│   │   ├── nutrition/
│   │   ├── workouts/
│   │   ├── products/
│   │   ├── analytics/
│   │   ├── search/
│   │   └── settings/
│   ├── layout.tsx
│   └── providers.tsx
├── shared/                         # reusable modules
│   ├── ui/                         # components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── lib/                         # utilities
│   │   ├── date.ts
│   │   ├── format.ts
│   │   └── ids.ts
│   ├── hooks/                       # common hooks
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   └── types/                        # common types
├── entities/                         # components for specific entities
│   ├── food/
│   │   ├── food-card.tsx
│   │   ├── food-form.tsx
│   │   └── index.ts
│   ├── transaction/
│   └── ...
├── features/                         # functional modules
│   ├── add-transaction/
│   │   ├── add-transaction-dialog.tsx
│   │   ├── use-add-transaction.ts
│   │   └── index.ts
│   ├── scan-barcode/
│   └── ...
├── widgets/                          # dashboard widgets
│   ├── balance-widget/
│   ├── calories-widget/
│   └── ...
├── entity-engine/                     # central data engine
│   ├── engine.ts
│   ├── schema-registry.ts
│   ├── validators.ts
│   └── relations.ts
├── db/                                # Dexie configuration
│   ├── dexie.ts
│   ├── schema.ts
│   └── migrations.ts
├── sync/                              # synchronization
│   ├── sync-engine.ts
│   ├── sync-queue.ts
│   └── conflict-resolver.ts
├── api/                               # external APIs
│   ├── food-api.ts
│   ├── exercise-api.ts
│   ├── barcode-api.ts
│   └── adapters/
│       ├── food-adapter.ts
│       └── exercise-adapter.ts
├── import/                            # data import
│   ├── import-foods.ts
│   └── import-exercises.ts
├── analytics/                         # analytics functions
│   ├── finance-analytics.ts
│   └── nutrition-analytics.ts
└── config/                            # application configuration
    ├── constants.ts
    └── features.ts
```

## Development Roadmap

### Phase 1. Infrastructure
- [ ] Set up Next.js with TypeScript, Tailwind, shadcn/ui.
- [ ] Integrate Dexie.js, create basic tables (entities, events, relations).
- [ ] Implement Entity Engine with createEntity, getEntity.
- [ ] Simple UI to view and create records.

### Phase 2. Core System
- [ ] Schema registry for types: food, exercise, transaction.
- [ ] Dynamic forms and tables.
- [ ] Tags and notes.
- [ ] Basic search (Fuse.js).

### Phase 3. Finance Module
- [ ] Tables accounts, transactions, categories.
- [ ] UI: transaction list, add/edit.
- [ ] Expense chart.
- [ ] Budgets.

### Phase 4. Nutrition Module
- [ ] Tables foods, meals, meal_foods.
- [ ] Integration with Open Food Facts (search, barcode).
- [ ] UI: meals, add food, calorie calculation.

### Phase 5. Workouts Module
- [ ] Tables exercises, workouts, workout_exercises, sets.
- [ ] Integration with Wger (import exercises).
- [ ] UI: create workout, log sets.

### Phase 6. Synchronization
- [ ] Events table and sync engine (push/pull).
- [ ] Set up Supabase (events table, authentication).
- [ ] Implement pull requests and event application.
- [ ] Conflict handling (last write wins).

### Phase 7. Analytics and Reports
- [ ] Dashboard widgets.
- [ ] Charts for finance, nutrition, workouts.
- [ ] Analytics screen with period selection.

### Phase 8. PWA and Optimization
- [ ] Configure next-pwa, service worker.
- [ ] API caching.
- [ ] Background sync.
- [ ] Performance testing.

## Best Practices and Principles

1. **Offline-first** — all operations write to local DB; server is secondary.
2. **Universal data model** — one `entities` table instead of dozens.
3. **Graph relationships** — separate `relations` table for flexibility.
4. **Event sourcing** — every change generates an event; simplifies sync and provides history.
5. **Repository pattern** — data access only through Entity Engine; UI knows nothing about Dexie.
6. **Schema registry** — declarative type descriptions; UI generated dynamically.
7. **UUID with prefixes** — e.g., `food_123`, `tx_456` — for easy type identification from id.
8. **Zod validation** — based on schema registry.
9. **Live queries** — automatic UI update on data change.
10. **Minimal global state** — only UI state in Zustand; data lives in Dexie.
11. **Modularity** — each functional block (feature) is isolated.
12. **Testing** — critical parts (sync engine, conflicts) must be covered by tests.

---

*This guide provides a complete description of the Personal Life OS architecture. Following it, you will be able to build a scalable, offline-first application that combines finance, nutrition, and workouts.*