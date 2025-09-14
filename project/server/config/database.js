import { supabase, testSupabaseConnection } from './supabase.js';
import dotenv from 'dotenv';

dotenv.config();

// Export supabase client as pool for compatibility
export const pool = supabase;

// Test database connection
export const testConnection = async () => {
  return await testSupabaseConnection();
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Closing database connections...');
  process.exit(0);
});