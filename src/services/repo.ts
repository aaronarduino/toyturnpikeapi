import { AccountMetaRepo } from "./repo/account_meta.js";
import { ActivitiesRepo } from "./repo/activity.js";
import { PaymentMethodsRepo } from "./repo/payment_methods.js";
import { StatementsRepo } from "./repo/statement.js";
import { ToytagsRepo } from "./repo/toytags.js";
import { VehiclesRepo } from "./repo/vehicles.js";

export function BuildRepo(): Repo {
  const activitiesRepo: ActivitiesRepo = new ActivitiesRepo();
  const accountMetaRepo: AccountMetaRepo = new AccountMetaRepo();
  const statementsRepo: StatementsRepo = new StatementsRepo();
  const paymentMethodsRepo: PaymentMethodsRepo = new PaymentMethodsRepo();
  const vehiclesRepo: VehiclesRepo = new VehiclesRepo();
  const toytagsRepo: ToytagsRepo = new ToytagsRepo();
  const repo: Repo = new Repo(
    activitiesRepo,
    accountMetaRepo,
    statementsRepo,
    paymentMethodsRepo,
    vehiclesRepo,
    toytagsRepo,
  );
  return repo;
}

export class Repo {
  activities: ActivitiesRepo;
  accountMeta: AccountMetaRepo;
  statements: StatementsRepo;
  paymentMethods: PaymentMethodsRepo;
  vehicles: VehiclesRepo;
  toytags: ToytagsRepo;

  constructor(
    activitiesRepo: ActivitiesRepo,
    accountMetaRepo: AccountMetaRepo,
    statementsRepo: StatementsRepo,
    paymentMethodsRepo: PaymentMethodsRepo,
    vehiclesRepo: VehiclesRepo,
    toytagsRepo: ToytagsRepo,
  ) {
    this.activities = activitiesRepo;
    this.accountMeta = accountMetaRepo;
    this.statements = statementsRepo;
    this.paymentMethods = paymentMethodsRepo;
    this.vehicles = vehiclesRepo;
    this.toytags = toytagsRepo;
  }
}
