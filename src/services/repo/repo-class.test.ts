import { describe, it, expect } from "vitest";
import { Repo, BuildRepo } from "../repo.js";
import { ActivitiesRepo } from "./activity.js";
import { AccountMetaRepo } from "./account_meta.js";
import { StatementsRepo } from "./statement.js";
import { PaymentMethodsRepo } from "./payment_methods.js";
import { VehiclesRepo } from "./vehicles.js";
import { ToytagsRepo } from "./toytags.js";

describe("Repo", () => {
  it("constructs with all six repos", () => {
    const activities = new ActivitiesRepo();
    const accountMeta = new AccountMetaRepo();
    const statements = new StatementsRepo();
    const paymentMethods = new PaymentMethodsRepo();
    const vehicles = new VehiclesRepo();
    const toytags = new ToytagsRepo();
    const repo = new Repo(
      activities,
      accountMeta,
      statements,
      paymentMethods,
      vehicles,
      toytags,
    );

    expect(repo.activities).toBe(activities);
    expect(repo.accountMeta).toBe(accountMeta);
    expect(repo.statements).toBe(statements);
    expect(repo.paymentMethods).toBe(paymentMethods);
    expect(repo.vehicles).toBe(vehicles);
    expect(repo.toytags).toBe(toytags);
  });
});

describe("BuildRepo", () => {
  it("returns a Repo instance", () => {
    const repo = BuildRepo();
    expect(repo).toBeInstanceOf(Repo);
  });

  it("creates all six repos", () => {
    const repo = BuildRepo();
    expect(repo.activities).toBeInstanceOf(ActivitiesRepo);
    expect(repo.accountMeta).toBeInstanceOf(AccountMetaRepo);
    expect(repo.statements).toBeInstanceOf(StatementsRepo);
    expect(repo.paymentMethods).toBeInstanceOf(PaymentMethodsRepo);
    expect(repo.vehicles).toBeInstanceOf(VehiclesRepo);
    expect(repo.toytags).toBeInstanceOf(ToytagsRepo);
  });
});
