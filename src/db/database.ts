import Dexie, { type Table } from 'dexie'

// ===================================
// CORE ENTITY INTERFACES
// ===================================

export interface BaseEntity {
  id: string
  type: string
  name: string
  data: Record<string, any>
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
  data?: Record<string, any>
  createdAt: number
}

export interface SyncEvent {
  id: string
  entityId: string
  entityType: string
  eventType: 'create' | 'update' | 'delete'
  payload: any
  timestamp: number
  deviceId: string
  synced: number // 0 = false, 1 = true for Dexie compatibility
}

export interface Tag {
  id: string
  name: string
  color: string
}

// ===================================
// FINANCE ENTITY INTERFACES
// ===================================

export type TransactionType = 'income' | 'expense'

export interface TransactionEntity extends BaseEntity {
  type: 'transaction'
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
  type: 'account'
  data: {
    name: string
    currency: string
    balance: number
    initialBalance: number
    icon?: string
    color?: string
  }
}

export interface CategoryEntity extends BaseEntity {
  type: 'category'
  data: {
    name: string
    color: string
    icon: string
    categoryType: TransactionType
    parentId?: string
  }
}

// ===================================
// DEXIE DATABASE CLASS
// ===================================

export class PersonalLifeOSDB extends Dexie {
  entities!: Table<BaseEntity, string>
  relations!: Table<Relation, string>
  events!: Table<SyncEvent, string>
  tags!: Table<Tag, string>

  constructor() {
    super('PersonalLifeOSDB')

    this.version(1).stores({
      entities: '++id, type, name, createdAt, updatedAt, deleted, *tags',
      relations: '++id, fromId, toId, type, createdAt',
      events: '++id, entityId, entityType, eventType, timestamp, deviceId, synced',
      tags: '++id, name, color',
    })

    // Version 2: Add finance-specific indexes
    this.version(2).stores({
      entities:
        '++id, type, name, createdAt, updatedAt, deleted, *tags, [type+deleted], [type+createdAt]',
    })
  }
}

// ===================================
// DATABASE INSTANCE
// ===================================

export const db = new PersonalLifeOSDB()

// ===================================
// HELPER FUNCTIONS
// ===================================

export function generateId(type: string): string {
  return `${type}_${crypto.randomUUID()}`
}

export function createSyncEvent(
  entityId: string,
  entityType: string,
  eventType: 'create' | 'update' | 'delete',
  payload: any
): SyncEvent {
  return {
    id: generateId('evt'),
    entityId,
    entityType,
    eventType,
    payload,
    timestamp: Date.now(),
    deviceId: getDeviceId(),
    synced: 0,
  }
}

function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = `device_${crypto.randomUUID()}`
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

// ===================================
// GENERIC CRUD FUNCTIONS
// ===================================

export async function createEntity<T extends BaseEntity>(
  entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Date.now()
  const id = generateId(entity.type)

  await db.entities.add({
    ...entity,
    id,
    createdAt: now,
    updatedAt: now,
  } as T)

  // Create sync event
  const event = createSyncEvent(id, entity.type, 'create', entity)
  await db.events.add(event)

  return id
}

export async function updateEntity<T extends BaseEntity>(
  id: string,
  data: Partial<T['data']>
): Promise<void> {
  const entity = await db.entities.get(id)
  if (!entity) {
    throw new Error(`Entity ${id} not found`)
  }

  const now = Date.now()
  const updatedData = { ...entity.data, ...data }

  await db.entities.update(id, {
    data: updatedData,
    updatedAt: now,
  })

  // Create sync event
  const event = createSyncEvent(id, entity.type, 'update', { id, data: updatedData })
  await db.events.add(event)
}

export async function deleteEntity(id: string): Promise<void> {
  const entity = await db.entities.get(id)
  if (!entity) {
    throw new Error(`Entity ${id} not found`)
  }

  // Soft delete
  await db.entities.update(id, {
    deleted: true,
  })

  // Create sync event
  const event = createSyncEvent(id, entity.type, 'delete', { id })
  await db.events.add(event)
}

export async function getEntitiesByType(type: string): Promise<BaseEntity[]> {
  return await db.entities
    .where('type')
    .equals(type)
    .and((entity) => !entity.deleted)
    .toArray()
}

export async function getEntityById(id: string): Promise<BaseEntity | undefined> {
  return await db.entities.get(id)
}

export async function getPendingSyncEvents(): Promise<SyncEvent[]> {
  return await db.events.where('synced').equals(0).toArray()
}

export async function markEventsAsSynced(eventIds: string[]): Promise<void> {
  const bulkUpdates = eventIds.map((id) => ({ key: id, changes: { synced: 1 } }))
  await db.events.bulkUpdate(bulkUpdates)
}
