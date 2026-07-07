import { describe, it, expect } from "vitest";
import { Repo, BuildRepo } from "../repo.js";
import { ActivitiesRepo } from "./activity.js";
import { VehiclesRepo } from "./vehicles.js";

describe("Repo", () => {
  it("constructs with activities and vehicles repos", () => {
    const activities = new ActivitiesRepo();
    const vehicles = new VehiclesRepo();
    const repo = new Repo(activities, vehicles);

    expect(repo.activities).toBe(activities);
    expect(repo.vehicles).toBe(vehicles);
  });
});

describe("BuildRepo", () => {
  it("returns a Repo instance", () => {
    const repo = BuildRepo();
    expect(repo).toBeInstanceOf(Repo);
  });

  it("creates activities and vehicles repos", () => {
    const repo = BuildRepo();
    expect(repo.activities).toBeInstanceOf(ActivitiesRepo);
    expect(repo.vehicles).toBeInstanceOf(VehiclesRepo);
  });
});
