import { supabase, testSupabaseConnection } from "./supabase.js";
import pg from "pg";
import dotenv from "dotenv";

const { Pool } = pg;

dotenv.config();

// Database configuration switch
// Change this to 'postgresql' to use local PostgreSQL, or 'supabase' to use Supabase
const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

// Export the appropriate database client based on configuration
export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "olossia_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "1234",
});

// Log when database connects
pool.on("connect", () => {
  console.log("✅ PostgreSQL connected successfully");
});

// Log any errors
pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
  process.exit(-1);
});

// Test the connection
pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database connection failed:", err);
  }
});

// Test database connection
export const testConnection = async () => {
  if (DATABASE_TYPE === "postgresql") {
    return await testPostgreSQLConnection();
  } else {
    return await testSupabaseConnection();
  }
};

// Database query wrapper to handle both Supabase and PostgreSQL
export const dbQuery = async (query, params = []) => {
  if (DATABASE_TYPE === "postgresql") {
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  } else {
    // For Supabase, this would need to be handled differently
    // as Supabase uses its own query methods
    throw new Error(
      "Direct SQL queries not supported with Supabase. Use Supabase client methods instead."
    );
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing database connections...");
  if (DATABASE_TYPE === "postgresql") {
    await pool.end();
  }
  process.exit(0);
});

console.log(`🗄️ Database configured for: ${DATABASE_TYPE.toUpperCase()}`);
