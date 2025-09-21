#!/usr/bin/env node
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load server/.env explicitly (robust on Windows and different CWDs)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverEnvPath = path.join(__dirname, "..", ".env");
dotenv.config({ path: serverEnvPath });
// Also allow a top-level .env (cwd) to provide/override values if present
dotenv.config();

import { pool } from "../config/database.js";

const PRODUCT_ID = process.argv[2];

if (!PRODUCT_ID) {
  console.error("Usage: node server/scripts/activate-product.js <productId>");
  process.exit(1);
}

async function run() {
  try {
    // Update product status to active
    const { data: updated, error: updateErr } = await pool
      .from("products")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("id", PRODUCT_ID)
      .select()
      .single();

    if (updateErr) throw updateErr;

    console.log("Product updated to active:", updated.id);

    // Insert a default variant so the product has an active variant
    const variant = {
      product_id: PRODUCT_ID,
      name: "Default Variant",
      sku: `var-${PRODUCT_ID.slice(0, 8)}`,
      price: updated.price || 0,
      stock_quantity: updated.stock_quantity || 10,
      attributes: {},
      images: [],
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: varData, error: varErr } = await pool
      .from("product_variants")
      .insert(variant)
      .select()
      .single();

    if (varErr) throw varErr;

    console.log("Inserted variant:", varData.id);
    process.exit(0);
  } catch (err) {
    console.error("Failed to activate product:", err.message || err);
    process.exit(1);
  }
}

run();
