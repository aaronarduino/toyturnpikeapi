import { ActivitiesRepo } from "./repo/activity.js";
import { VehiclesRepo, type Vehicle } from "./repo/vehicles.js";

export function BuildRepo(): Repo {
  const activitiesRepo: ActivitiesRepo = new ActivitiesRepo();
  const vehiclesRepo: VehiclesRepo = new VehiclesRepo();
  const repo: Repo = new Repo(activitiesRepo, vehiclesRepo);
  return repo;
}

export class Repo {
  activities: ActivitiesRepo;
  vehicles: VehiclesRepo;

  constructor(activitiesRepo: ActivitiesRepo, vehiclesRepo: VehiclesRepo) {
    this.activities = activitiesRepo;
    this.vehicles = vehiclesRepo;
  }
}
