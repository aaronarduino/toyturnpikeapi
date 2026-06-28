import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { config } from "dotenv";
import type { NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

config();

const client = new MongoClient(process.env.DB_URI as string);
const db = client.db();

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // Optional: if you don't provide a client, database transactions won't be enabled.
    client,
  }),
  emailAndPassword: {
    enabled: true,
  },
});

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Convert Express headers into a format Better Auth understands
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Active session required" });
    }

    // Attach user and session context to the request object for downstream routes
    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Internal server error during authentication" });
  }
}
