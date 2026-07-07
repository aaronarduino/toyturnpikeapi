import { describe, it, expect, vi, beforeEach } from "vitest";

const mongoMock = vi.hoisted(() => {
  const toArray = vi.fn().mockResolvedValue([]);
  const find = vi.fn().mockReturnValue({ toArray });
  const aggregate = vi.fn();
  const findOne = vi.fn();
  const countDocuments = vi.fn();
  const insertOne = vi.fn();
  const collection = { aggregate, find, findOne, countDocuments, insertOne };
  const db = { collection: vi.fn(() => collection) };

  return {
    toArray, find, db, findOne, countDocuments, insertOne,
    MongoClient: function () { return { db: vi.fn(() => db) }; },
    ObjectId: vi.fn((id: string) => id),
  };
});

vi.mock("mongodb", () => ({
  MongoClient: mongoMock.MongoClient,
  ObjectId: mongoMock.ObjectId,
}));

import { VehiclesRepo } from "../vehicles";

const repo = new VehiclesRepo();
const accountId = "acc-123";

const sampleVehicles = [
  { plate_number: "ABC-123", state: "CA", account_id: accountId },
  { plate_number: "XYZ-789", state: "NV", account_id: accountId },
];

describe("VehiclesRepo.getVehicles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns vehicles for a given account_id", async () => {
    mongoMock.toArray.mockResolvedValue(sampleVehicles);

    const result = await repo.getVehicles(accountId);

    expect(result).toHaveLength(2);
    expect(result[0]!.plate_number).toBe("ABC-123");
    expect(result[1]!.plate_number).toBe("XYZ-789");
  });

  it("calls find with correct account_id filter", async () => {
    mongoMock.toArray.mockResolvedValue([]);

    await repo.getVehicles(accountId);

    expect(mongoMock.find).toHaveBeenCalledWith({ account_id: accountId });
  });

  it("uses the vehicles collection", async () => {
    mongoMock.toArray.mockResolvedValue([]);

    await repo.getVehicles(accountId);

    expect(mongoMock.db.collection).toHaveBeenCalledWith("vehicles");
  });

  it("returns empty array when no vehicles found", async () => {
    mongoMock.toArray.mockResolvedValue([]);

    const result = await repo.getVehicles(accountId);

    expect(result).toEqual([]);
  });
});

describe("VehiclesRepo.createVehicle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts a vehicle and returns it", async () => {
    const vehicle = { plate_number: "ABC-123", state: "CA", account_id: accountId };

    const result = await repo.createVehicle(vehicle);

    expect(mongoMock.insertOne).toHaveBeenCalledWith(vehicle);
    expect(result).toEqual(vehicle);
  });

  it("uses the vehicles collection", async () => {
    await repo.createVehicle({ plate_number: "X", state: "Y", account_id: accountId });

    expect(mongoMock.db.collection).toHaveBeenCalledWith("vehicles");
  });
});
