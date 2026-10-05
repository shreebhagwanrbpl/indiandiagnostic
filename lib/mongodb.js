import { MongoClient } from "mongodb";
import dns from "node:dns";

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore DNS config error if not permitted
}

export const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://rajbiosis15_db_user:R7jmlgZ3RfeB0MEz@superadminrbpl.aneatej.mongodb.net/company_master_cms?retryWrites=true&w=majority";

export const MONGODB_DB = process.env.MONGODB_DB || "company_master_cms";

let cachedClient = global._mongoClient || null;
let cachedDb = global._mongoDb || null;

export async function getMongoClient() {
  if (cachedClient) return cachedClient;

  const client = new MongoClient(MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
  });

  await client.connect();
  cachedClient = client;
  global._mongoClient = client;
  return client;
}

export async function getMongoDb() {
  if (cachedDb) return cachedDb;
  const client = await getMongoClient();
  const db = client.db(MONGODB_DB);
  cachedDb = db;
  global._mongoDb = db;
  return db;
}
