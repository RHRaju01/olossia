import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
dotenv.config();

// PostgreSQL connection configuration
// Prefer explicit DATABASE_URL/SUPABASE_DB_URL (works with Supabase and other managed Postgres)
const connectionString =
  process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || null;

let poolConfig;
if (connectionString) {
  poolConfig = {
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Use SSL for managed/cloud Postgres (Supabase). Allow self-signed when necessary.
    ssl: { rejectUnauthorized: false },
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    database: process.env.DB_NAME || "olossia_db",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  };
}

// Create PostgreSQL connection pool
export const pool = new Pool(poolConfig);

// Test PostgreSQL connection
export const testPostgreSQLConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log("✅ PostgreSQL connected successfully");
    return true;
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    throw error;
  }
};

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
  process.exit(-1);
});
