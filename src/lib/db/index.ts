import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type SchemaDB = PostgresJsDatabase<typeof schema>;

let _db: SchemaDB | null = null;

function getDb(): SchemaDB {
  if (_db) return _db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Database features are unavailable in demo mode."
    );
  }

  const client = postgres(connectionString, {
    prepare: false,
    connect_timeout: 5, // 5s max — fail fast so demo data can take over
  });
  _db = drizzle(client, { schema });
  return _db;
}

/**
 * Lazy database proxy — the actual postgres connection is only created
 * when a property on `db` is first accessed, not at module import time.
 * If DATABASE_URL is missing, a clear error is thrown at call-time
 * instead of crashing the entire process on startup.
 */
export const db: SchemaDB = new Proxy({} as SchemaDB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export type DB = SchemaDB;
