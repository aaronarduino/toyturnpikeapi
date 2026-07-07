import { testDb } from "../../utils/database.js";

export type Vehicle = {
  plate_number: string;
  state: string;
  account_id: string;
};

export class VehiclesRepo {
  async getVehicles(account_id: string): Promise<Vehicle[]> {
    const vehiclesDb = testDb.collection("vehicles");
    const vehiclesData = await vehiclesDb
      .find<Vehicle>({ account_id: account_id })
      .toArray();
    return vehiclesData;
  }

  async getVehiclesCountByAccountId(account_id: string): Promise<number> {
    const vehiclesDb = testDb.collection("vehicles");
    const vehiclesCount: number = await vehiclesDb.countDocuments({
      account_id: account_id,
    });
    return vehiclesCount;
  }

  async createVehicle(vehicle: Vehicle): Promise<Vehicle> {
    const vehiclesDb = testDb.collection("vehicles");
    await vehiclesDb.insertOne(vehicle);
    return vehicle;
  }
}
