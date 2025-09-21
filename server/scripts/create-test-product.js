#!/usr/bin/env node
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables from the server/.env file explicitly first
// This ensures scripts run from the repository root (or other cwd) still
// see the server-specific secrets used by the Supabase/postgres config.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEnvPath = path.join(__dirname, "..", ".env");
dotenv.config({ path: serverEnvPath });

// Also allow a top-level .env (cwd) to provide/override values if present
dotenv.config();

async function main() {
  try {
    // Import Product after dotenv has loaded to avoid import-time failures
    // when the DB/Supabase config requires env vars.
    const { Product } = await import("../models/Product.js");

    const product = await Product.create({
      name: "Test Product",
      description: "A small product created for smoke tests",
      price: 9.99,
      brandId: null,
      categoryId: null,
      sku: `TEST-SKU-${Date.now()}`,
      stockQuantity: 10,
      images: ["https://via.placeholder.com/300"],
      specifications: { color: "red", size: "M" },
    });
    console.log("Created product:", product.id || product);
  } catch (err) {
    console.error("Failed to create product:", err.message || err);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
