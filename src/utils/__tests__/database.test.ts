import { describe, it, expect } from "vitest";

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
