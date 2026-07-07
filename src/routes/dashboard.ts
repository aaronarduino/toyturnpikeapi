import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, requireAuth } from "../utils/auth.js";
import { testDb } from "../utils/database.js";
import { BuildRepo, type Repo } from "../services/repo.js";
import type { Activity } from "../services/repo/activity.js";

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

  if (activities.length < 1) {
    return res
      .status(404)
      .send({ error: "No activity found for the given date range" });
  }

  const payments = {
    statement_balance: 0.0,
    auto_pay_date: "07/01/2026",
    current_account_balance: activities[0]?.balance,
  };

  res.send(payments);
});

router.get("/payment_methods", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const paymentMethodsDb = testDb.collection("payment_methods");
  const paymentMethod = await paymentMethodsDb.findOne({
    account_id: session?.user.id,
    primary: true,
  });

  res.send({
    primary: {
      card_number: paymentMethod?.card_last_four,
      expiration_date: paymentMethod?.expiration_date,
    },
  });
});

router.get("/vehicles_toytags", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const vehiclesDb = testDb.collection("vehicles");
  const toytagsDb = testDb.collection("toytags");

  const vehiclesCount: number = await vehiclesDb.countDocuments({
    account_id: session?.user.id,
  });
  const toytagsCount: number = await toytagsDb.countDocuments({
    account_id: session?.user.id,
  });

  res.send({
    vehicles: vehiclesCount,
    toytags: toytagsCount,
  });
});

router.get("/activity", (req, res) => {
  res.send({
    tolls: 0,
    fees: 0,
    payments: 1,
    adjustments: 0,
    refunds: 0,
  });
});

export default router;
