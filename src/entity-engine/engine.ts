// Entity Engine - Core API
import { db } from "@/db/database";
import {
  validateEntity,
  validateEntityData,
  type ZodErrorLike,
} from "./validators";
import type {
  BaseEntity,
  SyncEvent,
  CreateEntityInput,
  QueryFilters,
  QueryOptions,
} from "./types";

function generateId(type: string): string {
  return `${type}_${crypto.randomUUID()}`;
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let deviceId = localStorage.getItem("device_id");
  if (!deviceId) {
    deviceId = `device_${crypto.randomUUID()}`;
    localStorage.setItem("device_id", deviceId);
  }
  return deviceId;
}

function createSyncEvent(
  entityId: string,
  entityType: string,
  eventType: "create" | "update" | "delete",
  payload: unknown,
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
  };
}

export async function createEntity<T extends BaseEntity>(
  input: CreateEntityInput<T>,
): Promise<string> {
  const validation = validateEntity({
    type: input.type,
    name: input.name,
    data: input.data,
    tags: input.tags,
  } as Omit<T, "id" | "createdAt" | "updatedAt">);

  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors?.map((e: ZodErrorLike) => e.message).join(", ")}`,
    );
  }

  const now = Date.now();
  const id = generateId(input.type);

  const entity: BaseEntity = {
    id,
    type: input.type,
    name: input.name,
    data: input.data,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    tags: input.tags || [],
  };

  await db.entities.add(entity);
  const event = createSyncEvent(id, input.type, "create", entity);
  await db.events.add(event);

  return id;
}

export async function updateEntity(
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  const entity = await db.entities.get(id);
  if (!entity) throw new Error(`Entity ${id} not found`);

  const validation = validateEntityData(entity.type, {
    ...entity.data,
    ...data,
  });
  if (!validation.success) {
    throw new Error(
      `Validation failed: ${validation.errors?.map((e: ZodErrorLike) => e.message).join(", ")}`,
    );
  }

  const now = Date.now();
  await db.entities.update(id, {
    data: { ...entity.data, ...data },
    updatedAt: now,
  });

  const event = createSyncEvent(id, entity.type, "update", {
    id,
    data: { ...entity.data, ...data },
  });
  await db.events.add(event);
}

export async function deleteEntity(id: string): Promise<void> {
  const entity = await db.entities.get(id);
  if (!entity) throw new Error(`Entity ${id} not found`);

  await db.entities.update(id, { deleted: true, updatedAt: Date.now() });
  const event = createSyncEvent(id, entity.type, "delete", { id });
  await db.events.add(event);
}

export async function getEntityById(
  id: string,
): Promise<BaseEntity | undefined> {
  return await db.entities.get(id);
}

export async function queryEntities(
  filters: QueryFilters,
  options?: QueryOptions,
): Promise<BaseEntity[]> {
  let collection = db.entities.toCollection();

  if (filters.type)
    collection = collection.and((e) => e.type === filters.type!);
  if (filters.deleted === false) collection = collection.and((e) => !e.deleted);
  if (filters.createdAt?.gte)
    collection = collection.and((e) => e.createdAt >= filters.createdAt!.gte!);
  if (filters.createdAt?.lte)
    collection = collection.and((e) => e.createdAt <= filters.createdAt!.lte!);

  const sortBy = options?.sortBy || "createdAt";
  const sortOrder = options?.sortOrder || "desc";

  let entities = await collection.toArray();
  entities.sort((a, b) => {
    const cmp = (a[sortBy] || 0) < (b[sortBy] || 0) ? -1 : 1;
    return sortOrder === "asc" ? cmp : -cmp;
  });

  if (options?.offset) entities = entities.slice(options.offset);
  if (options?.limit) entities = entities.slice(0, options.limit);

  return entities;
}

export async function getEntitiesByType(
  type: string,
  includeDeleted = false,
): Promise<BaseEntity[]> {
  const entities = await db.entities.where("type").equals(type).toArray();
  return includeDeleted ? entities : entities.filter((e) => !e.deleted);
}
