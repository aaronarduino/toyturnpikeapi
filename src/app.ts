// const express = require("express");
// const express = require("express");
import express from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth, requireAuth } from "./utils/auth.js";
import { client, db, testDb } from "./utils/database.js";
import { BuildRepo, type Repo } from "./services/repo.js";
import type { Vehicle } from "./services/repo/vehicles.js";
import type { Activity } from "./services/repo/activity.js";

var app = express();
const port = 3000;
const repo: Repo = BuildRepo();

app.all("/api/auth/{*any}", toNodeHandler(auth));
app.use(express.json());

app.get("/", async (req, res) => {
  res.send({ message: "hello, world!" });
});

///////////////////////////////////////////////////////////////////////////////
// Dashboard Routes ///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

app.get("/dashboard", requireAuth, (req, res) => {
  res.send({
    account: {
      id: 254503,
      holder: "test name",
      primary_address: "1234 test lane, test city, CA, US",
      logged_in: true,
    },
  });
});

app.get("/dashboard/payments", requireAuth, async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const startDate: Date = new Date();

  // TODO: Gather data from all the different repos
  startDate.setDate(1);
  const activities: Activity[] = await repo.activities.getActivitiesByDateRange(
    session?.user.id as string,
    startDate,
    new Date(),
  );
  // Satements
  // Account meta

  // Guards:
  if (activities.length < 1) {
    // TODO: return error status code
  }

  const payments = {
    statement_balance: 0.0,
    auto_pay_date: "07/01/2026",
    current_account_balance: activities[0],
  };

  res.send(payments);
});

app.get("/dashboard/payment_methods", requireAuth, async (req, res) => {
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

app.get("/dashboard/vehicles_toytags", requireAuth, async (req, res) => {
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

app.get("/dashboard/activity", requireAuth, (req, res) => {
  res.send({
    tolls: 0,
    fees: 0,
    payments: 1,
    adjustments: 0,
    refunds: 0,
  });
});

///////////////////////////////////////////////////////////////////////////////
// Vehicles & TOYTAGs Routes //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

app.get("/vehicles", requireAuth, async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const vehiclesData: Vehicle[] = await repo.vehicles.getVehicles(
    session?.user.id as string,
  );

  res.send({
    vehicles: vehiclesData,
  });
});

app.get("/vehicles/toytags", requireAuth, async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  const toytagsDb = testDb.collection("toytags_vehicles");

  const toytagsData = await toytagsDb
    .find({ account_id: session?.user.id })
    .toArray();

  res.send({
    toytags: toytagsData,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
