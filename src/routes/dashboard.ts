import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, requireAuth } from "../utils/auth.js";
import { testDb } from "../utils/database.js";
import { BuildRepo, type Repo } from "../services/repo.js";
import { ActivityType, type Activity } from "../services/repo/activity.js";
import type { AccountMetadata } from "../services/repo/account_meta.js";
import type { Statement } from "../services/repo/statement.js";

const router = Router();
const repo: Repo = BuildRepo();

router.use(requireAuth);

router.get("/", (req, res) => {
  res.send({
    account: {
      id: 254503,
      holder: "test name",
      primary_address: "1234 test lane, test city, CA, US",
      logged_in: true,
    },
  });
});

router.get("/payments", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const startDate: Date = new Date();
  startDate.setDate(1);
  const activities: Activity[] = await repo.activities.getActivitiesByDateRange(
    session?.user.id as string,
    startDate,
    new Date(),
  );

  const accountMeta: AccountMetadata | null =
    await repo.accountMeta.getAccountMetaByAccountId(
      session?.user.id as string,
    );
  const statement: Statement | null = await repo.statements.getLatestStatement(
    session?.user.id as string,
  );

  if (activities.length < 1) {
    return res
      .status(404)
      .send({ error: "No activity found for the given date range" });
  }
  if (accountMeta == null) {
    return res
      .status(404)
      .send({ error: "No auto pay date found for account" });
  }
  if (statement == null) {
    return res.status(404).send({ error: "Latest statement not found" });
  }

  const payments = {
    statement_balance: statement?.statement_balance,
    auto_pay_date: accountMeta?.auto_pay_date,
    current_account_balance: activities[0]?.balance,
  };

  res.send(payments);
});

router.get("/payment_methods", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const paymentMethods = await repo.paymentMethods.getPaymentMethods(
    session?.user.id as string,
    true,
  );

  if (paymentMethods.length < 1) {
    return res.status(404).send({ error: "No primary payment method found" });
  }

  res.send({
    primary: {
      card_number: paymentMethods[0]?.card_last_four,
      expiration_date: paymentMethods[0]?.expiration_date,
    },
  });
});

router.get("/vehicles_toytags", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const vehiclesCount: number = await repo.vehicles.getVehiclesCountByAccountId(
    session?.user.id as string,
  );
  const toytagsCount: number = await repo.toytags.getToytagsCountByAccountId(
    session?.user.id as string,
  );

  res.send({
    vehicles: vehiclesCount,
    toytags: toytagsCount,
  });
});

router.get("/activity", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const startDate: Date = new Date();
  startDate.setDate(1);
  const activities: Activity[] = await repo.activities.getActivitiesByDateRange(
    session?.user.id as string,
    startDate,
    new Date(),
  );

  res.send({
    tolls: activities.filter((a) => (a.type = ActivityType.Toll)).length,
    fees: activities.filter((a) => (a.type = ActivityType.Fee)).length,
    payments: activities.filter((a) => (a.type = ActivityType.Payment)).length,
    adjustments: activities.filter((a) => (a.type = ActivityType.Adjustment))
      .length,
    refunds: activities.filter((a) => (a.type = ActivityType.Refund)).length,
  });
});

export default router;
