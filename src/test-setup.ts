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

  const mockMongoClient = {
    db: vi.fn(() => mockDb),
  };

  return {
    MongoClient: vi.fn(() => mockMongoClient),
    ObjectId: vi.fn((id: string) => id),
  };
});
