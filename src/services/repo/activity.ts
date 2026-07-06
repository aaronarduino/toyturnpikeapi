import { ObjectId } from "mongodb";
import { testDb } from "../../utils/database.js";

export enum ActivityType {
  Toll = "Toll",
  Fee = "Fee",
  Payment = "Payment",
  Adjustment = "Adjustment",
  Refund = "Refund",
}

export enum ActivityStatus {
  Applied = "Applied",
  Paid = "Paid",
  Pending = "Pending",
}

export type Activity = {
  id: string;
  account_id: string;
  type: ActivityType;
  activity: Date;
  status: ActivityStatus;
  description: string;
  vehicle: string | null;
  toytag: string | null;
  amount: number;
  posted: Date;
};
// export type Activity = {
//   statement_balance: number;
//   auto_pay_date: string;
//   current_account_balance: number;
// };

export class ActivitiesRepo {
  async getActivitiesByDateRange(
    account_id: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Activity[]> {
    const activitiesDb = testDb.collection("activity");

    const activities: Activity[] = await activitiesDb
      .aggregate<Activity>([
        {
          $match: {
            account_id: account_id,
            activity: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        },
        {
          $setWindowFields: {
            sortBy: { eventTime: 1, _id: 1 },
            output: {
              balance: {
                $sum: "$amount",
                window: { documents: ["unbounded", "current"] },
              },
            },
          },
        },
      ])
      .toArray();

    return activities.sort((a, b) => b.posted.getTime() - a.posted.getTime());
  }
}
