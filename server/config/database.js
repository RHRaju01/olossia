import { supabase, testSupabaseConnection } from "./supabase.js";
import { pool as pgPool, testPostgreSQLConnection } from "./postgresql.js";
import dotenv from "dotenv";

dotenv.config();

// Database configuration switch
// Change this to 'postgresql' to use local PostgreSQL, or 'supabase' to use Supabase
const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

// If DATABASE_TYPE is 'supabase' but a direct DB connection string is available
// (SUPABASE_DB_URL or DATABASE_URL), prefer using pg Pool so we can run
// standard SQL queries. This enables the same SQL code to work across
// Supabase, AWS RDS, and local Postgres.
const hasDirectDbUrl = Boolean(
  process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.DATABASE_URL_CONNSTRING
);

// Allow forcing the Supabase client even when a direct DB URL exists
const FORCE_SUPABASE_CLIENT = String(
  process.env.FORCE_SUPABASE_CLIENT || "false"
).toLowerCase();

const USE_PG =
  DATABASE_TYPE === "postgresql" ||
  (DATABASE_TYPE === "supabase" &&
    hasDirectDbUrl &&
    FORCE_SUPABASE_CLIENT !== "true");

// Export the appropriate database client based on configuration
// `pool` will be a pg Pool when USE_PG is true, otherwise it will be the Supabase client.
export const pool = USE_PG ? pgPool : supabase;

// Test database connection
export const testConnection = async () => {
  if (USE_PG) {
    return await testPostgreSQLConnection();
  } else {
    return await testSupabaseConnection();
  }
};

// Database query wrapper to handle both pg Pool and Supabase client
export const dbQuery = async (query, params = []) => {
  if (USE_PG) {
    const client = await pgPool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  } else {
    // Direct SQL is not available via the Supabase JS client here.
    // Recommend providing a direct DB connection (DATABASE_URL) if you need
    // to run raw SQL queries from the server.
    throw new Error(
      "Direct SQL queries not supported with Supabase client. Provide SUPABASE_DB_URL/DATABASE_URL to enable pg Pool."
    );
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing database connections...");
  if (USE_PG) {
    await pgPool.end();
  }
  process.exit(0);
});

console.log(
  `🗄️ Database configured for: ${
    USE_PG ? "POSTGRESQL (pg Pool)" : "SUPABASE (client)"
  } - DATABASE_TYPE=${DATABASE_TYPE}`
);
