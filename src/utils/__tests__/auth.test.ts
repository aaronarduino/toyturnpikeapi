import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextFunction } from "express";

vi.mock("../database.js", () => ({
  client: {},
  db: {},
  testDb: {},
}));

const betterAuthMock = vi.hoisted(() => ({
  betterAuth: vi.fn(() => ({
    api: { getSession: vi.fn() },
  })),
  mongodbAdapter: vi.fn(() => ({})),
  fromNodeHeaders: vi.fn((h: Record<string, unknown>) => h),
  expo: vi.fn(() => ({})),
}));

vi.mock("better-auth", () => ({
  betterAuth: betterAuthMock.betterAuth,
}));

vi.mock("better-auth/adapters/mongodb", () => ({
  mongodbAdapter: betterAuthMock.mongodbAdapter,
}));

vi.mock("better-auth/node", () => ({
  fromNodeHeaders: betterAuthMock.fromNodeHeaders,
}));

vi.mock("@better-auth/expo", () => ({
  expo: betterAuthMock.expo,
}));

import { requireAuth, auth } from "../auth.js";

function mockReqRes() {
  const req = { headers: { authorization: "Bearer test" } } as any;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as any;
  const next: NextFunction = vi.fn();
  return { req, res, next };
}

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("auth module loads correctly", () => {
    expect(auth).toBeDefined();
    expect(auth.api).toBeDefined();
    expect(auth.api.getSession).toBeDefined();
  });

  it("calls next() when a valid session is returned", async () => {
    const { req, res, next } = mockReqRes();
    const mockSession = {
      user: { id: "user-1", email: "test@example.com" },
      session: { id: "session-1" },
    };

    (auth.api.getSession as any).mockResolvedValue(mockSession);

    await requireAuth(req, res, next);

    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: req.headers,
    });
    expect(req.user).toEqual(mockSession.user);
    expect(req.session).toEqual(mockSession.session);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("returns 401 when no session is returned", async () => {
    const { req, res, next } = mockReqRes();

    (auth.api.getSession as any).mockResolvedValue(null);

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized: Active session required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 500 when getSession throws", async () => {
    const { req, res, next } = mockReqRes();

    (auth.api.getSession as any).mockRejectedValue(new Error("DB error"));

    await requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Internal server error during authentication",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
