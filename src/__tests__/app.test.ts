import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";

const mocks = vi.hoisted(() => {
  const mockRequireAuth = vi.fn(
    (_req: Request, _res: Response, next: NextFunction) => next(),
  );

  const mockActivitiesGetActivitiesByDateRange = vi.fn();
  const mockGetAccountMetaByAccountId = vi.fn();
  const mockGetLatestStatement = vi.fn();
  const mockGetPaymentMethods = vi.fn();
  const mockVehiclesGetVehicles = vi.fn();
  const mockCreateVehicle = vi.fn();
  const mockGetVehiclesCountByAccountId = vi.fn();
  const mockGetToytagsByAccountId = vi.fn();
  const mockGetToytagsCountByAccountId = vi.fn();

  return {
    mockRequireAuth,
    mockActivitiesGetActivitiesByDateRange,
    mockGetAccountMetaByAccountId,
    mockGetLatestStatement,
    mockGetPaymentMethods,
    mockVehiclesGetVehicles,
    mockCreateVehicle,
    mockGetVehiclesCountByAccountId,
    mockGetToytagsByAccountId,
    mockGetToytagsCountByAccountId,
    mockToArray: vi.fn().mockResolvedValue([]),
    mockFindOne: vi.fn().mockResolvedValue(null),
    mockCountDocuments: vi.fn().mockResolvedValue(0),
  };
});

vi.mock("../utils/auth.js", () => ({
  auth: { api: { getSession: vi.fn() } },
  requireAuth: mocks.mockRequireAuth,
}));

vi.mock("../utils/database.js", () => {
  const coll = {
    aggregate: vi.fn(),
    find: vi.fn(() => ({ toArray: mocks.mockToArray })),
    findOne: mocks.mockFindOne,
    countDocuments: mocks.mockCountDocuments,
  };

  const testDb = { collection: vi.fn(() => coll) };

  return { client: {}, db: testDb, testDb };
});

vi.mock("../services/repo.js", () => ({
  BuildRepo: vi.fn(() => ({
    activities: {
      getActivitiesByDateRange: mocks.mockActivitiesGetActivitiesByDateRange,
    },
    accountMeta: {
      getAccountMetaByAccountId: mocks.mockGetAccountMetaByAccountId,
    },
    statements: {
      getLatestStatement: mocks.mockGetLatestStatement,
    },
    paymentMethods: {
      getPaymentMethods: mocks.mockGetPaymentMethods,
    },
    vehicles: {
      getVehicles: mocks.mockVehiclesGetVehicles,
      getVehiclesCountByAccountId: mocks.mockGetVehiclesCountByAccountId,
      createVehicle: mocks.mockCreateVehicle,
    },
    toytags: {
      getToytagsByAccountId: mocks.mockGetToytagsByAccountId,
      getToytagsCountByAccountId: mocks.mockGetToytagsCountByAccountId,
    },
  })),
  Repo: vi.fn(),
}));

import app from "../app.js";

describe("App routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /", () => {
    it('returns { message: "hello, world!" }', async () => {
      const res = await request(app).get("/");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "hello, world!" });
    });
  });

  describe("GET /dashboard/payments", () => {
    it("returns payments when activities, account meta, and statement exist", async () => {
      mocks.mockActivitiesGetActivitiesByDateRange.mockResolvedValue([
        { id: "1", posted: new Date(), amount: 100, balance: 1.0 },
      ]);
      mocks.mockGetAccountMetaByAccountId.mockResolvedValue({
        id: "meta-1",
        account_id: "user-1",
        auto_pay_date: new Date("2026-07-01"),
      });
      mocks.mockGetLatestStatement.mockResolvedValue({
        id: "stmt-1",
        account_id: "user-1",
        statement_balance: 0.0,
      });

      const res = await request(app).get("/dashboard/payments");

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        statement_balance: 0.0,
        auto_pay_date: new Date("2026-07-01").toISOString(),
        current_account_balance: 1.0,
      });
    });

    it("returns 404 when no activities found", async () => {
      mocks.mockActivitiesGetActivitiesByDateRange.mockResolvedValue([]);

      const res = await request(app).get("/dashboard/payments");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: "No activity found for the given date range",
      });
    });
  });

  describe("GET /dashboard/payment_methods", () => {
    it("returns 404 when no primary payment method exists", async () => {
      mocks.mockGetPaymentMethods.mockResolvedValue([]);

      const res = await request(app).get("/dashboard/payment_methods");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: "No primary payment method found",
      });
    });

    it("returns primary card info when payment method exists", async () => {
      mocks.mockGetPaymentMethods.mockResolvedValue([
        {
          card_last_four: "1234",
          expiration_date: "12/28",
          primary: true,
          account_id: "user-1",
        },
      ]);

      const res = await request(app).get("/dashboard/payment_methods");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        primary: { card_number: "1234", expiration_date: "12/28" },
      });
    });
  });

  describe("GET /dashboard/vehicles_toytags", () => {
    it("returns vehicles and toytags counts", async () => {
      mocks.mockGetVehiclesCountByAccountId.mockResolvedValue(3);
      mocks.mockGetToytagsCountByAccountId.mockResolvedValue(5);

      const res = await request(app).get("/dashboard/vehicles_toytags");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ vehicles: 3, toytags: 5 });
    });
  });

  describe("GET /dashboard/activity", () => {
    it("returns activity summary counts", async () => {
      mocks.mockActivitiesGetActivitiesByDateRange.mockResolvedValue([
        {
          id: "1",
          account_id: "user-1",
          type: "Payment",
          activity: new Date(),
          status: "Applied",
          description: "test payment",
          vehicle: null,
          toytag: null,
          amount: 50,
          balance: 50,
          posted: new Date(),
        },
      ]);

      const res = await request(app).get("/dashboard/activity");

      expect(mocks.mockRequireAuth).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        tolls: 0,
        fees: 0,
        payments: 1,
        adjustments: 0,
        refunds: 0,
      });
    });
  });

  describe("GET /vehicles", () => {
    it("returns vehicles data", async () => {
      mocks.mockVehiclesGetVehicles.mockResolvedValue([
        { plate_number: "ABC-123", state: "CA" },
      ]);

      const res = await request(app).get("/vehicles");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        vehicles: [{ plate_number: "ABC-123", state: "CA" }],
      });
    });
  });

  describe("POST /vehicles", () => {
    it("creates a vehicle and returns 201", async () => {
      const newVehicle = { plate_number: "ABC-123", state: "CA" };
      mocks.mockCreateVehicle.mockResolvedValue({
        ...newVehicle,
        account_id: "user-1",
      });

      const res = await request(app)
        .post("/vehicles")
        .send(newVehicle);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        vehicle: { plate_number: "ABC-123", state: "CA", account_id: "user-1" },
      });
    });

    it("returns 400 when plate_number is missing", async () => {
      const res = await request(app)
        .post("/vehicles")
        .send({ state: "CA" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "plate_number and state are required" });
    });

    it("returns 400 when state is missing", async () => {
      const res = await request(app)
        .post("/vehicles")
        .send({ plate_number: "ABC-123" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "plate_number and state are required" });
    });
  });

  describe("GET /vehicles/toytags", () => {
    it("returns toytags data", async () => {
      mocks.mockGetToytagsByAccountId.mockResolvedValue([
        { toytag_id: "tag-1", account_id: "user-1" },
      ]);

      const res = await request(app).get("/vehicles/toytags");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        toytags: [{ toytag_id: "tag-1", account_id: "user-1" }],
      });
    });
  });
});
