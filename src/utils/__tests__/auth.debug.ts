import { vi } from "vitest";

// Mock ALL dependencies
vi.mock("dotenv", () => ({ config: vi.fn() }));
vi.mock("../database.js", () => ({ client: {}, db: {}, testDb: {} }));
vi.mock("mongodb", () => ({ MongoClient: function() {}, ObjectId: vi.fn() }));

vi.mock("better-auth", () => ({ betterAuth: vi.fn(() => ({ api: { getSession: vi.fn() } })) }));
vi.mock("better-auth/adapters/mongodb", () => ({ mongodbAdapter: vi.fn(() => ({})) }));
vi.mock("better-auth/node", () => ({ fromNodeHeaders: vi.fn((h: any) => h) }));
vi.mock("@better-auth/expo", () => ({ expo: vi.fn(() => ({})) }));

async function test() {
  console.time("import");
  try {
    const mod = await import("../auth.js");
    console.timeEnd("import");
    console.log("exports:", Object.keys(mod));
    console.log("auth:", mod.auth);
    console.log("requireAuth:", typeof mod.requireAuth);
  } catch (e) {
    console.timeEnd("import");
    console.error("ERROR:", e);
  }
}

test();
