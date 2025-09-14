import { supabase, testSupabaseConnection } from './supabase.js';
import { pool as pgPool, testPostgreSQLConnection } from './postgresql.js';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration switch
// Change this to 'postgresql' to use local PostgreSQL, or 'supabase' to use Supabase
const DATABASE_TYPE = process.env.DATABASE_TYPE || 'supabase';

// Export the appropriate database client based on configuration
export const pool = DATABASE_TYPE === 'postgresql' ? pgPool : supabase;

// Test database connection
export const testConnection = async () => {
  if (DATABASE_TYPE === 'postgresql') {
    return await testPostgreSQLConnection();
  } else {
    return await testSupabaseConnection();
  }
};

// Database query wrapper to handle both Supabase and PostgreSQL
export const dbQuery = async (query, params = []) => {
  if (DATABASE_TYPE === 'postgresql') {
    const client = await pgPool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  } else {
    // For Supabase, this would need to be handled differently
    // as Supabase uses its own query methods
    throw new Error('Direct SQL queries not supported with Supabase. Use Supabase client methods instead.');
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  if (DATABASE_TYPE === 'postgresql') {
    await pgPool.end();
  }
  process.exit(0);
});

console.log(`🗄️ Database configured for: ${DATABASE_TYPE.toUpperCase()}`);