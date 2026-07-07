import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../utils/auth.js";

const router = Router();

router.all("/{*any}", toNodeHandler(auth));

export default router;
