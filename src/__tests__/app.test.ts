import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";

const mocks = vi.hoisted(() => {
  const mockRequireAuth = vi.fn(
    (_req: Request, _res: Response, next: NextFunction) => next(),
  );
  const mockActivitiesGetActivitiesByDateRange = vi.fn();
  const mockVehiclesGetVehicles = vi.fn();
  const mockToArray = vi.fn().mockResolvedValue([]);
  const mockFindOne = vi.fn().mockResolvedValue(null);
  const mockCountDocuments = vi.fn().mockResolvedValue(0);

  return {
    mockRequireAuth,
    mockActivitiesGetActivitiesByDateRange,
    mockVehiclesGetVehicles,
    mockToArray,
    mockFindOne,
    mockCountDocuments,
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
    vehicles: { getVehicles: mocks.mockVehiclesGetVehicles },
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

  describe("GET /dashboard", () => {
    it("returns account info", async () => {
      const res = await request(app).get("/dashboard");

      expect(mocks.mockRequireAuth).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        account: {
          id: 254503,
          holder: "test name",
          primary_address: "1234 test lane, test city, CA, US",
          logged_in: true,
        },
      });
    });
  });

  describe("GET /dashboard/payments", () => {
    it("returns payments when activities exist", async () => {
      mocks.mockActivitiesGetActivitiesByDateRange.mockResolvedValue([
        { id: "1", posted: new Date(), amount: 100, balance: 1.0 },
      ]);

      const res = await request(app).get("/dashboard/payments");

      expect(res.status).toBe(200);
      expect(res.body).toStrictEqual({
        statement_balance: 0.0,
        auto_pay_date: "07/01/2026",
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
    it("returns payment method data with no primary card", async () => {
      const res = await request(app).get("/dashboard/payment_methods");

      expect(res.status).toBe(200);
      expect(res.body.primary).toBeDefined();
    });

    it("returns primary card info when payment method exists", async () => {
      mocks.mockFindOne.mockResolvedValue({
        card_last_four: "1234",
        expiration_date: "12/28",
      });

      const res = await request(app).get("/dashboard/payment_methods");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        primary: { card_number: "1234", expiration_date: "12/28" },
      });
    });
  });

  describe("GET /dashboard/vehicles_toytags", () => {
    it("returns vehicles and toytags counts", async () => {
      const res = await request(app).get("/dashboard/vehicles_toytags");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ vehicles: 0, toytags: 0 });
    });
  });

  describe("GET /dashboard/activity", () => {
    it("returns activity summary counts", async () => {
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

  describe("GET /vehicles/toytags", () => {
    it("returns toytags data", async () => {
      mocks.mockToArray.mockResolvedValue([
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
