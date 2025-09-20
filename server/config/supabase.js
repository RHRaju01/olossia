import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables:");
  console.error("SUPABASE_URL:", supabaseUrl ? "Set" : "Missing");
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY:",
    process.env.SUPABASE_SERVICE_ROLE_KEY ? "Set" : "Missing"
  );
  console.error(
    "SUPABASE_ANON_KEY:",
    process.env.SUPABASE_ANON_KEY ? "Set" : "Missing"
  );
  throw new Error("Missing Supabase environment variables");
}

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test Supabase connection
export const testSupabaseConnection = async () => {
  // Retry a few times to handle transient Cloudflare / network errors (520 etc.)
  const attempts = parseInt(process.env.SUPABASE_TEST_RETRIES || "3", 10);
  const backoffMs = parseInt(
    process.env.SUPABASE_TEST_BACKOFF_MS || "1000",
    10
  );
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const { data, error } = await supabase
        .from("roles")
        .select("count")
        .limit(1);

      if (error) throw error;
      console.log("✅ Supabase connected successfully");
      return true;
    } catch (error) {
      lastErr = error;
      console.warn(
        `Supabase connection attempt ${i + 1} failed:`,
        error.message || error
      );
      // last attempt -> break and throw
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
  console.error(
    "❌ Supabase connection failed after retries:",
    lastErr && lastErr.message ? lastErr.message : lastErr
  );
  throw lastErr;
};
