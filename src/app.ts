// const express = require("express");
// const express = require("express");
import express from "express";
var app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send({ message: "Hello, world!" });
});

app.get("/dashboard", (req, res) => {
  res.send({
    account: {
      id: 254503,
      holder: "test name",
      primary_address: "1234 test lane, test city, CA, US",
      logged_in: true,
    },
  });
});

app.get("/dashboard/payments", (req, res) => {
  res.send({
    statement_balance: 0.0,
    auto_pay_date: "07/01/2026",
    current_accont_balance: 0.0,
  });
});

app.get("/dashboard/payment_methods", (req, res) => {
  res.send({
    primary: {
      card_number: 1234,
      expiration_date: "07/01/2026",
    },
  });
});

app.get("/dashboard/vehicles_toytags", (req, res) => {
  res.send({
    vehicles: 1,
    toytags: 1,
  });
});

app.get("/dashboard/activity", (req, res) => {
  res.send({
    tolls: 0,
    fees: 0,
    payments: 1,
    adjustments: 0,
    refunds: 0,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
