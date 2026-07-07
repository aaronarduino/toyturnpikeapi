import { describe, it, expect, vi } from "vitest";

vi.mock("mongodb", () => {
  const mockCollection = {
    aggregate: vi.fn(),
    find: vi.fn(() => ({ toArray: vi.fn() })),
    findOne: vi.fn(),
    countDocuments: vi.fn(),
  };

  const mockDb = {
    collection: vi.fn(() => mockCollection),
  };

  return {
    MongoClient: function () {
      return { db: vi.fn(() => mockDb) };
    },
    ObjectId: vi.fn((id: string) => id),
  };
});

const { client, db, testDb } = await import("../database.js");

describe("database", () => {
  it("exports a MongoClient instance", () => {
    expect(client).toBeDefined();
  });

  it("exports a db instance", () => {
    expect(db).toBeDefined();
  });

  it("exports a testDb instance", () => {
    expect(testDb).toBeDefined();
  });

  it("testDb and db have the same shape (both from mocked client)", () => {
    expect(testDb).toEqual(db);
  });
});
