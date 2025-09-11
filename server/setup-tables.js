import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

// Use service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupDatabase() {
  console.log("🚀 Setting up cart and wishlist tables with service role...");

  try {
    // Create carts table
    const { data: cartResult, error: cartError } = await supabaseAdmin.rpc(
      "exec_sql",
      {
        query: `
        CREATE TABLE IF NOT EXISTS carts (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, product_id)
        );
      `,
      }
    );

    if (cartError) {
      console.log(
        "Cart table creation error (might be expected):",
        cartError.message
      );
    } else {
      console.log("✅ Cart table created successfully");
    }

    // Create wishlists table
    const { data: wishlistResult, error: wishlistError } =
      await supabaseAdmin.rpc("exec_sql", {
        query: `
        CREATE TABLE IF NOT EXISTS wishlists (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, product_id)
        );
      `,
      });

    if (wishlistError) {
      console.log(
        "Wishlist table creation error (might be expected):",
        wishlistError.message
      );
    } else {
      console.log("✅ Wishlist table created successfully");
    }

    // Try to verify tables exist by attempting to select from them
    console.log("\n🔍 Verifying tables...");

    const { data: cartData, error: cartSelectError } = await supabaseAdmin
      .from("carts")
      .select("id")
      .limit(1);

    if (cartSelectError) {
      console.log(
        "❌ Cart table verification failed:",
        cartSelectError.message
      );
    } else {
      console.log("✅ Cart table verified");
    }

    const { data: wishlistData, error: wishlistSelectError } =
      await supabaseAdmin.from("wishlists").select("id").limit(1);

    if (wishlistSelectError) {
      console.log(
        "❌ Wishlist table verification failed:",
        wishlistSelectError.message
      );
    } else {
      console.log("✅ Wishlist table verified");
    }

    console.log("\n🎉 Database setup completed!");
  } catch (error) {
    console.error("❌ Database setup failed:", error);

    console.log("\n📋 Manual Setup Required:");
    console.log("Go to Supabase Dashboard → SQL Editor and run:");
    console.log(`
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
    `);
  }
}

setupDatabase();
