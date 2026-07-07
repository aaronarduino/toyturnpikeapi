import { testDb } from "../../utils/database.js";

export type PaymentMethod = {
  card_last_four: number;
  expiration_date: Date;
  primary: boolean;
  account_id: string;
};

export class PaymentMethodsRepo {
  async getPaymentMethods(
    account_id: string,
    isPrimary: boolean,
  ): Promise<PaymentMethod[]> {
    const paymentMethodsDb = testDb.collection("payment_methods");
    const paymentMethods: PaymentMethod[] = await paymentMethodsDb
      .find<PaymentMethod>({ account_id: account_id })
      .toArray();

    if (isPrimary) {
      return paymentMethods.filter((pm) => pm.primary == true);
    }

    return paymentMethods;
  }
}
