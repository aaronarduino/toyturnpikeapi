import { MongoClient } from "mongodb";
import { config } from "dotenv";

config();
export const client = new MongoClient(process.env.DB_URI as string);
export const db = client.db();
export const testDb = client.db("test");
