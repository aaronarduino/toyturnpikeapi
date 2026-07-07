import { testDb } from "../../utils/database.js";
import type { Vehicle } from "./vehicles.js";

export type ToytagVehicle = {
  id: string;
  toytag_number: string;
  vehicle_id: string;
  account_id: string;
  vehicles: Vehicle[];
};

export class ToytagsRepo {
  async getToytagsByAccountId(account_id: string): Promise<ToytagVehicle[]> {
    const toytagsDb = testDb.collection("toytags_vehicles");
    const toytags: ToytagVehicle[] = await toytagsDb
      .find<ToytagVehicle>({ account_id: account_id })
      .toArray();
    return toytags;
  }

  async getToytagsCountByAccountId(account_id: string): Promise<number> {
    const toytagsDb = testDb.collection("toytags");

    const toytagsCount: number = await toytagsDb.countDocuments({
      account_id: account_id,
    });

    return toytagsCount;
  }
}
