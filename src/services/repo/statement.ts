import { testDb } from "../../utils/database.js";

export type Statement = {
  id: string;
  account_id: string;
  statement_balance: number;
};

export class StatementsRepo {
  async getLatestStatement(account_id: string): Promise<Statement | null> {
    const statementsDb = testDb.collection("statements");
    const statement: Statement | null = await statementsDb.findOne<Statement>({
      account_id: account_id,
    });
    return statement;
  }
}
