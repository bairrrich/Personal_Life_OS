// Entity Engine Public API
export {
  createEntity,
  updateEntity,
  deleteEntity,
  getEntityById,
  queryEntities,
  getEntitiesByType,
} from "./engine";
export { validateEntity, validateEntityData } from "./validators";
export { getSchema, getAllSchemas, schemas } from "./schema-registry";

export type {
  BaseEntity,
  Relation,
  SyncEvent,
  Tag,
  TransactionEntity,
  AccountEntity,
  FoodEntity,
  MealEntity,
  ExerciseEntity,
  WorkoutEntity,
  DomainEntity,
  EntityType,
  CreateEntityInput,
  QueryFilters,
  QueryOptions,
} from "./types";
