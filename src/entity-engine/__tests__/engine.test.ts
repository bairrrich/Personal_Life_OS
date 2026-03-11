// Entity Engine Tests
import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { db } from "@/db/database";
import {
  createEntity,
  getEntityById,
  updateEntity,
  deleteEntity,
  queryEntities,
  getEntitiesByType,
} from "@/entity-engine/engine";
import type { CreateEntityInput } from "@/entity-engine/types";

describe("Entity Engine", () => {
  beforeAll(async () => {
    await db.open();
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    await db.entities.clear();
    await db.events.clear();
  });

  describe("createEntity", () => {
    it("should create a valid transaction entity", async () => {
      const input: CreateEntityInput = {
        type: "transaction",
        name: "Coffee",
        data: {
          amount: 5,
          currency: "USD",
          accountId: "acc_1",
          categoryId: "food",
          transactionType: "expense",
          date: Date.now(),
        },
      };

      const id = await createEntity(input);
      expect(id).toMatch(/^transaction_/);

      const entity = await getEntityById(id);
      expect(entity).toBeDefined();
      expect(entity?.type).toBe("transaction");
      expect(entity?.name).toBe("Coffee");
    });

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
      };

      const id = await createEntity(input);
      expect(id).toMatch(/^food_/);
    });

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
      };

      await createEntity(input);

      const events = await db.events.toArray();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("create");
    });

    it("should throw on invalid entity type", async () => {
      const input: CreateEntityInput = {
        type: "unknown",
        name: "Test",
        data: {},
      };

      await expect(createEntity(input)).rejects.toThrow("Unknown entity type");
    });
  });

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
      };

      const id = await createEntity(input);
      await updateEntity(id, { balance: 1500 });

      const entity = await getEntityById(id);
      expect(entity?.data.balance).toBe(1500);
    });

    it("should update updatedAt timestamp", async () => {
      const input: CreateEntityInput = {
        type: "food",
        name: "Apple",
        data: { calories: 52, protein: 0.3, fat: 0.2, carbs: 14 },
      };

      const id = await createEntity(input);
      const before = await getEntityById(id);

      await new Promise((resolve) => setTimeout(resolve, 10));
      await updateEntity(id, { calories: 55 });

      const after = await getEntityById(id);
      expect(after!.updatedAt).toBeGreaterThan(before!.updatedAt);
    });

    it("should throw on non-existent entity", async () => {
      await expect(updateEntity("nonexistent", {})).rejects.toThrow(
        "not found",
      );
    });
  });

  describe("deleteEntity", () => {
    it("should soft delete entity", async () => {
      const input: CreateEntityInput = {
        type: "workout",
        name: "Morning Run",
        data: { date: Date.now() },
      };

      const id = await createEntity(input);
      await deleteEntity(id);

      const entity = await getEntityById(id);
      expect(entity?.deleted).toBe(true);
    });

    it("should create sync event on delete", async () => {
      const input: CreateEntityInput = {
        type: "meal",
        name: "Breakfast",
        data: { date: Date.now(), mealType: "breakfast" },
      };

      const id = await createEntity(input);
      await deleteEntity(id);

      const events = await db.events.toArray();
      const deleteEvent = events.find((e) => e.eventType === "delete");
      expect(deleteEvent).toBeDefined();
    });
  });

  describe("queryEntities", () => {
    beforeEach(async () => {
      await createEntity({
        type: "transaction",
        name: "Tx1",
        data: {
          amount: 100,
          currency: "USD",
          accountId: "acc1",
          categoryId: "food",
          transactionType: "expense",
          date: 1000,
        },
      });
      await createEntity({
        type: "transaction",
        name: "Tx2",
        data: {
          amount: 200,
          currency: "USD",
          accountId: "acc1",
          categoryId: "salary",
          transactionType: "income",
          date: 2000,
        },
      });
      await createEntity({
        type: "food",
        name: "Food1",
        data: { calories: 100, protein: 10, fat: 5, carbs: 20 },
      });
    });

    it("should filter by type", async () => {
      const transactions = await queryEntities({ type: "transaction" });
      expect(transactions).toHaveLength(2);
      expect(transactions.every((e) => e.type === "transaction")).toBe(true);
    });

    it("should exclude deleted entities by default", async () => {
      const all = await queryEntities({ type: "transaction" });
      await deleteEntity(all[0].id);

      const remaining = await queryEntities({
        type: "transaction",
        deleted: false,
      });
      expect(remaining).toHaveLength(1);
    });

    it("should sort by createdAt desc by default", async () => {
      const transactions = await queryEntities({ type: "transaction" });
      expect(transactions[0].createdAt).toBeGreaterThanOrEqual(
        transactions[1].createdAt,
      );
    });

    it("should apply limit and offset", async () => {
      const all = await queryEntities({ type: "transaction" });
      const limited = await queryEntities(
        { type: "transaction" },
        { limit: 1 },
      );
      expect(limited).toHaveLength(1);

      const offset = await queryEntities(
        { type: "transaction" },
        { offset: 1 },
      );
      expect(offset.length).toBeLessThan(all.length);
    });
  });

  describe("getEntitiesByType", () => {
    beforeEach(async () => {
      await createEntity({
        type: "exercise",
        name: "Pushups",
        data: {},
      });
      await createEntity({
        type: "exercise",
        name: "Squats",
        data: {},
      });
    });

    it("should return all entities of type", async () => {
      const exercises = await getEntitiesByType("exercise");
      expect(exercises).toHaveLength(2);
    });

    it("should exclude deleted by default", async () => {
      const all = await getEntitiesByType("exercise");
      await deleteEntity(all[0].id);

      const remaining = await getEntitiesByType("exercise");
      expect(remaining).toHaveLength(1);
    });

    it("should include deleted when requested", async () => {
      const all = await getEntitiesByType("exercise");
      await deleteEntity(all[0].id);

      const withDeleted = await getEntitiesByType("exercise", true);
      expect(withDeleted).toHaveLength(2);
    });
  });
});
