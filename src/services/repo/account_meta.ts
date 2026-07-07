import { testDb } from "../../utils/database.js";

export type AccountMetadata = {
  id: string;
  account_id: string;
  auto_pay_date: Date;
};

export class AccountMetaRepo {
  async getAccountMetaByAccountId(
    account_id: string,
  ): Promise<AccountMetadata | null> {
    const accountMetaDb = testDb.collection("account_meta");
    const accountMeta: AccountMetadata | null =
      await accountMetaDb.findOne<AccountMetadata>({ account_id: account_id });
    return accountMeta;
  }
}
