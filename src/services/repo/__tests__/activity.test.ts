import { describe, it, expect, vi, beforeEach } from "vitest";

const mongoMock = vi.hoisted(() => {
  const toArray = vi.fn().mockResolvedValue([]);
  const aggregate = vi.fn().mockReturnValue({ toArray });
  const find = vi.fn();
  const findOne = vi.fn();
  const countDocuments = vi.fn();
  const collection = { aggregate, find, findOne, countDocuments };
  const db = { collection: vi.fn(() => collection) };

  return {
    toArray, aggregate, find, findOne, countDocuments, db,
    MongoClient: function () { return { db: vi.fn(() => db) }; },
    ObjectId: vi.fn((id: string) => id),
  };
});

vi.mock("mongodb", () => ({
  MongoClient: mongoMock.MongoClient,
  ObjectId: mongoMock.ObjectId,
}));

import { ActivitiesRepo, ActivityType, ActivityStatus } from "../activity";

const repo = new ActivitiesRepo();
const accountId = "acc-123";
const startDate = new Date("2026-01-01");
const endDate = new Date("2026-01-31");

const sampleActivities = [
  {
    id: "1",
    account_id: accountId,
    type: ActivityType.Toll,
    activity: new Date("2026-01-15"),
    status: ActivityStatus.Paid,
    description: "Toll charge",
    vehicle: "ABC-123",
    toytag: null,
    amount: -5.50,
    posted: new Date("2026-01-15T12:00:00Z"),
  },
  {
    id: "2",
    account_id: accountId,
    type: ActivityType.Payment,
    activity: new Date("2026-01-20"),
    status: ActivityStatus.Applied,
    description: "Payment received",
    vehicle: null,
    toytag: null,
    amount: 50.00,
    posted: new Date("2026-01-20T08:00:00Z"),
  },
  {
    id: "3",
    account_id: accountId,
    type: ActivityType.Toll,
    activity: new Date("2026-01-10"),
    status: ActivityStatus.Pending,
    description: "Another toll",
    vehicle: "XYZ-789",
    toytag: null,
    amount: -3.75,
    posted: new Date("2026-01-10T14:00:00Z"),
  },
];

describe("ActivitiesRepo.getActivitiesByDateRange", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns activities sorted by posted descending", async () => {
    mongoMock.toArray.mockResolvedValue(sampleActivities);

    const result = await repo.getActivitiesByDateRange(accountId, startDate, endDate);

    expect(result).toHaveLength(3);
    expect(result[0]!.posted.getTime()).toBeGreaterThanOrEqual(result[1]!.posted.getTime());
    expect(result[1]!.posted.getTime()).toBeGreaterThanOrEqual(result[2]!.posted.getTime());
  });

  it("calls aggregate with correct $match stage", async () => {
    mongoMock.toArray.mockResolvedValue([]);

    await repo.getActivitiesByDateRange(accountId, startDate, endDate);

    expect(mongoMock.aggregate).toHaveBeenCalledOnce();
    const pipeline = mongoMock.aggregate.mock.calls[0]![0] as any[];
    const matchStage = pipeline[0]!.$match;

    expect(matchStage).toEqual({
      account_id: accountId,
      activity: {
        $gte: startDate,
        $lte: endDate,
      },
    });
  });

  it("includes $setWindowFields stage in pipeline", async () => {
    mongoMock.toArray.mockResolvedValue([]);

    await repo.getActivitiesByDateRange(accountId, startDate, endDate);

    const pipeline = mongoMock.aggregate.mock.calls[0]![0] as any[];
    const windowStage = pipeline.find((s: any) => s.$setWindowFields);
    expect(windowStage).toBeDefined();
  });

  it("uses correct collection name", async () => {
    mongoMock.toArray.mockResolvedValue([]);

    await repo.getActivitiesByDateRange(accountId, startDate, endDate);

    expect(mongoMock.db.collection).toHaveBeenCalledWith("activity");
  });

  it("returns empty array when no activities match", async () => {
    mongoMock.toArray.mockResolvedValue([]);

    const result = await repo.getActivitiesByDateRange(accountId, startDate, endDate);

    expect(result).toEqual([]);
  });
});
