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
}
