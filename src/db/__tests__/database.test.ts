import { describe, it, expect, beforeEach } from "vitest";
import { db, createEntity, getEntitiesByType } from "@/db/database";

describe("Database", () => {
  beforeEach(async () => {
    await db.entities.clear();
    await db.events.clear();
  });

  it("should create entity successfully", async () => {
    const id = await createEntity({
      type: "test",
      name: "Test Entity",
      data: {},
    });
    expect(id).toBeDefined();
    expect(id).toMatch(/^test_/);
  });

  it("should get entities by type", async () => {
    await createEntity({
      type: "transaction",
      name: "Transaction 1",
      data: { amount: 100 },
    });
    await createEntity({
      type: "transaction",
      name: "Transaction 2",
      data: { amount: 200 },
    });
    const transactions = await getEntitiesByType("transaction");
    expect(transactions.length).toBe(2);
  });
});
