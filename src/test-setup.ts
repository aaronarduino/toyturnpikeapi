import { vi } from "vitest";

vi.mock("mongodb", () => {
  const mockToArray = vi.fn();
  const mockAggregate = vi.fn(() => ({ toArray: mockToArray }));
  const mockFind = vi.fn(() => ({ toArray: mockToArray }));
  const mockFindOne = vi.fn();
  const mockCountDocuments = vi.fn();

  const mockCollection = {
    aggregate: mockAggregate,
    find: mockFind,
    findOne: mockFindOne,
    countDocuments: mockCountDocuments,
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
