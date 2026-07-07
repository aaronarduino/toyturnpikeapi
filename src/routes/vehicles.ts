import { Router } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth, requireAuth } from "../utils/auth.js";
import { testDb } from "../utils/database.js";
import { BuildRepo, type Repo } from "../services/repo.js";
import type { Vehicle } from "../services/repo/vehicles.js";

const router = Router();
const repo: Repo = BuildRepo();

router.use(requireAuth);

router.get("/", async (req, res) => {
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

router.get("/toytags", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  const toytagsData = await repo.toytags.getToytagsByAccountId(
    session?.user.id as string,
  );

  res.send({
    toytags: toytagsData,
  });
});

export default router;
