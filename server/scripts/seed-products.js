#!/usr/bin/env node
/**
 * Seed script for products, brands, categories, product_variants, warehouses and stock_alerts
 * Usage: node server/scripts/seed-products.js
 * Ensure environment variables for DB connection are present (see server/.env or process env)
 */
import dotenv from "dotenv";
import path from "path";
// Load server .env explicitly so the script has the same env as the server
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });

// Delay importing the database client until after dotenv loads to avoid
// ESM import hoisting which would initialize the DB client before env vars are set.
let pool;
let dbQuery;
const loadDb = async () => {
  const mod = await import("../config/database.js");
  pool = mod.pool;
  dbQuery = mod.dbQuery;
};

// Lightweight slugify helper to avoid adding an external dependency
const slugify = (input) => {
  if (!input) return "";
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const MOCK_PRODUCTS = [
  {
    id: "silk-midi-dress",
    name: "Silk Midi Dress",
    brand: "ZARA",
    price: 129.0,
    originalPrice: 189.0,
    image:
      "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "women",
    isNew: true,
    discount: 32,
    rating: 4.8,
    reviews: 124,
    colors: ["#FF6B9D", "#000000", "#FFFFFF"],
  },
  {
    id: "premium-cotton-blazer",
    name: "Premium Cotton Blazer",
    brand: "H&M",
    price: 89.0,
    image:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "men",
    isNew: false,
    discount: 0,
    rating: 4.6,
    reviews: 89,
    colors: ["#8B4513", "#000000", "#708090"],
  },
  {
    id: "vintage-denim-jacket",
    name: "Vintage Denim Jacket",
    brand: "LEVI'S",
    price: 159.0,
    originalPrice: 199.0,
    image:
      "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "women",
    isNew: false,
    discount: 20,
    rating: 4.9,
    reviews: 203,
    colors: ["#4169E1", "#000080", "#87CEEB"],
  },
  {
    id: "floral-maxi-dress",
    name: "Floral Maxi Dress",
    brand: "MANGO",
    price: 99.0,
    image:
      "https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "women",
    isNew: true,
    discount: 0,
    rating: 4.7,
    reviews: 156,
    colors: ["#FFB6C1", "#FFC0CB", "#FF69B4"],
  },
  {
    id: "leather-crossbody-bag",
    name: "Leather Crossbody Bag",
    brand: "COACH",
    price: 299.0,
    originalPrice: 399.0,
    image:
      "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "accessories",
    isNew: false,
    discount: 25,
    rating: 4.9,
    reviews: 67,
    colors: ["#8B4513", "#000000", "#D2691E"],
  },
  {
    id: "minimalist-sneakers",
    name: "Minimalist Sneakers",
    brand: "NIKE",
    price: 119.0,
    image:
      "https://images.pexels.com/photos/1464625/pexels-photo-1464625.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "shoes",
    isNew: true,
    discount: 0,
    rating: 4.8,
    reviews: 234,
    colors: ["#FFFFFF", "#000000", "#FF6B9D"],
  },
];

// Target totals for seeding
const TARGET_PRODUCT_COUNT = 50;
const TARGET_TOTAL_COLOR_VARIANTS = 40; // aim for ~30-50 across all products
const REVIEWS_PER_PRODUCT_MIN = 1;
const REVIEWS_PER_PRODUCT_MAX = 5;

// Generate additional products from the MOCK_PRODUCTS templates until TARGET_PRODUCT_COUNT
function buildProductRoster() {
  const roster = [];
  // clone templates first
  roster.push(...MOCK_PRODUCTS);
  let idx = 0;
  while (roster.length < TARGET_PRODUCT_COUNT) {
    const tpl = MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length];
    const copy = Object.assign({}, tpl);
    // make a unique name/slug
    const suffix = `seed-${roster.length + 1}`;
    copy.id = `${tpl.id}-${suffix}`;
    copy.name = `${tpl.name} ${suffix}`;
    // vary price a little
    copy.price =
      Math.round(tpl.price * (0.8 + Math.random() * 0.6) * 100) / 100;
    // ensure at least 3 images per product (use picsum seeded URLs)
    copy.image = tpl.image;
    copy.images = [
      tpl.image,
      `https://picsum.photos/seed/${slugify(copy.id)}-1/800/800`,
      `https://picsum.photos/seed/${slugify(copy.id)}-2/800/800`,
    ];
    // assign 1-3 colors sampled from tpl.colors or generated
    const colors = tpl.colors || ["#000000"];
    const colorCount =
      1 + Math.floor(Math.random() * Math.min(3, colors.length));
    copy.colors = [];
    for (let i = 0; i < colorCount; i++)
      copy.colors.push(colors[i % colors.length]);
    roster.push(copy);
    idx++;
  }
  return roster;
}

// Ensure we have some fake users to assign as review authors; returns an array of user ids
async function ensureFakeUsers(client, count = 30) {
  const ids = [];
  const isPg = client && client.query;
  if (isPg) {
    // Try to find existing seed users
    const res = await client.query(
      `SELECT id FROM users WHERE email LIKE 'seed-user-%' LIMIT $1`,
      [count]
    );
    for (const r of res) ids.push(r.id);
    const need = count - ids.length;
    for (let i = 0; i < need; i++) {
      const email = `seed-user-${Date.now()}-${i}@example.com`;
      const passwordHash = "seed";
      const first = `Seed${i}`;
      const last = `User`;
      const ins = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, created_at, updated_at) VALUES ($1,$2,$3,$4, now(), now()) RETURNING id`,
        [email, passwordHash, first, last]
      );
      ids.push(ins[0].id);
    }
    return ids;
  }

  // Supabase flow
  const supa = pool;
  const { data: existing, error: selErr } = await supa
    .from("users")
    .select("id")
    .like("email", "seed-user-%")
    .limit(count);
  if (selErr) throw selErr;
  existing && existing.forEach((r) => ids.push(r.id));
  const need = count - ids.length;
  for (let i = 0; i < need; i++) {
    const email = `seed-user-${Date.now()}-${i}@example.com`;
    const passwordHash = "seed";
    const first = `Seed${i}`;
    const last = `User`;
    const { data, error } = await supa
      .from("users")
      .insert({
        email,
        password_hash: passwordHash,
        first_name: first,
        last_name: last,
      })
      .select("id");
    if (error) throw error;
    ids.push(data[0].id);
  }
  return ids;
}

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
// Default size options to include in product specifications
const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];

async function findOrCreateBrand(client, name) {
  const slug = slugify(name, { lower: true });
  // If running with pg Pool client
  if (client && client.query) {
    const rows = await client.query(
      `SELECT id FROM brands WHERE name = $1 OR slug = $2 LIMIT 1`,
      [name, slug]
    );
    if (rows.length > 0) return rows[0].id;
    const res = await client.query(
      `INSERT INTO brands (name, slug, is_active) VALUES ($1, $2, true) RETURNING id`,
      [name, slug]
    );
    return res[0].id;
  }

  // Supabase client flow
  const supa = pool;
  const { data: existing, error: selErr } = await supa
    .from("brands")
    .select("id")
    .or(`name.eq.${name},slug.eq.${slug}`)
    .limit(1);
  if (selErr) throw selErr;
  if (existing && existing.length > 0) return existing[0].id;

  const { data, error } = await supa
    .from("brands")
    .insert({ name, slug, is_active: true })
    .select("id");
  if (error) throw error;
  return data[0].id;
}

async function findOrCreateCategory(client, cat) {
  const slug = slugify(cat, { lower: true });
  if (client && client.query) {
    const rows = await client.query(
      `SELECT id FROM categories WHERE slug = $1 OR name = $2 LIMIT 1`,
      [slug, cat]
    );
    if (rows.length > 0) return rows[0].id;
    const res = await client.query(
      `INSERT INTO categories (name, slug, is_active) VALUES ($1, $2, true) RETURNING id`,
      [cat, slug]
    );
    return res[0].id;
  }

  const supa = pool;
  const { data: existing, error: selErr } = await supa
    .from("categories")
    .select("id")
    .or(`slug.eq.${slug},name.eq.${cat}`)
    .limit(1);
  if (selErr) throw selErr;
  if (existing && existing.length > 0) return existing[0].id;

  const { data, error } = await supa
    .from("categories")
    .insert({ name: cat, slug, is_active: true })
    .select("id");
  if (error) throw error;
  return data[0].id;
}

async function findOrCreateWarehouse(client) {
  // If using pg client
  if (client && client.query) {
    const rows = await client.query(
      `SELECT id FROM warehouses WHERE is_active = true LIMIT 1`
    );
    if (rows.length > 0) return rows[0].id;
    // Create a default warehouse
    const code = `WH-${Date.now().toString().slice(-5)}`;
    const address = { line1: "Default Warehouse", city: "N/A" };
    const res = await client.query(
      `INSERT INTO warehouses (name, code, address, is_active) VALUES ($1, $2, $3, true) RETURNING id`,
      ["Default Warehouse", code, JSON.stringify(address)]
    );
    return res[0].id;
  }

  // Supabase client flow
  const supa = pool;
  const { data: existing, error: selErr } = await supa
    .from("warehouses")
    .select("id")
    .eq("is_active", true)
    .limit(1);
  if (selErr) throw selErr;
  if (existing && existing.length > 0) return existing[0].id;
  const code = `WH-${Date.now().toString().slice(-5)}`;
  const address = { line1: "Default Warehouse", city: "N/A" };
  const { data, error } = await supa
    .from("warehouses")
    .insert({ name: "Default Warehouse", code, address, is_active: true })
    .select("id");
  if (error) throw error;
  return data[0].id;
}

async function seed() {
  // Ensure DB module is loaded after dotenv so env vars are set
  await loadDb();

  const isPg = pool && typeof pool.connect === "function";
  let client = null;
  if (isPg) {
    client = await pool.connect();
  } else {
    console.log(
      "DB pool not available or running in Supabase client mode — seeder will use Supabase client methods."
    );
  }
  try {
    console.log("Seeding products...");
    const warehouseId = await findOrCreateWarehouse(client);

    const roster = buildProductRoster();
    // track total color variant count so we can stop early if we reach target
    let totalColorVariants = 0;
    // create some fake users for reviews
    const fakeUsers = await ensureFakeUsers(client, 40);

    for (const p of roster) {
      const brandId = await findOrCreateBrand(client, p.brand);
      const categoryId = await findOrCreateCategory(client, p.category);
      const slug = slugify(p.id || p.name, { lower: true });

      // Insert product if not exists
      let productId;
      if (client && client.query) {
        const existing = await client.query(
          `SELECT id FROM products WHERE slug = $1 LIMIT 1`,
          [slug]
        );
        if (existing.length > 0) {
          productId = existing[0].id;
          console.log(
            `Product exists, skipping insert: ${slug} (${productId})`
          );
        } else {
          const imagesJson = JSON.stringify([p.image]);
          const comparePrice = p.originalPrice || null;
          const stockQty = 0; // we'll set variant-level stock
          const prodRes = await client.query(
            `INSERT INTO products (name, slug, price, compare_price, brand_id, category_id, images, stock_quantity, status)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'active') RETURNING id`,
            [
              p.name,
              slug,
              p.price,
              comparePrice,
              brandId,
              categoryId,
              imagesJson,
              stockQty,
            ]
          );
          productId = prodRes[0].id;
          console.log(`Inserted product: ${p.name} -> ${productId}`);
        }
      } else {
        // Supabase flow
        const supa = pool;
        const { data: existing, error: selErr } = await supa
          .from("products")
          .select("id")
          .eq("slug", slug)
          .limit(1);
        if (selErr) throw selErr;
        if (existing && existing.length > 0) {
          productId = existing[0].id;
          console.log(
            `Product exists, skipping insert: ${slug} (${productId})`
          );
        } else {
          const imagesJson = [p.image];
          const comparePrice = p.originalPrice || null;
          const stockQty = 0;
          const { data, error } = await supa
            .from("products")
            .insert({
              name: p.name,
              slug,
              price: p.price,
              compare_price: comparePrice,
              brand_id: brandId,
              category_id: categoryId,
              images: imagesJson,
              stock_quantity: stockQty,
              // store available colors/sizes as product-level specifications for convenience
              specifications: {
                available_colors: p.colors || [],
                available_sizes: DEFAULT_SIZES,
              },
              status: "active",
            })
            .select("id");
          if (error) throw error;
          productId = data[0].id;
          console.log(`Inserted product: ${p.name} -> ${productId}`);
        }
      }

      // Create variants per color
      const variantIds = [];
      const collectedColors = [];
      for (const color of p.colors || []) {
        const variantName = `${p.name} — ${color}`;
        const sku = `${slug}-${color.replace(/[^a-z0-9]/gi, "")}-${randInt(
          1000,
          9999
        )}`;
        const variantStock = randInt(0, 50); // randomized stock
        const attr = JSON.stringify({ color });
        const imagesJson = JSON.stringify([p.image]);

        let vid;
        let savedStock;
        if (client && client.query) {
          const vRes = await client.query(
            `INSERT INTO product_variants (product_id, name, sku, price, stock_quantity, attributes, images, is_active)
             VALUES ($1,$2,$3,$4,$5,$6,$7,true)
             ON CONFLICT (sku) DO UPDATE SET stock_quantity = EXCLUDED.stock_quantity
             RETURNING id, stock_quantity`,
            [
              productId,
              variantName,
              sku,
              p.price,
              variantStock,
              attr,
              imagesJson,
            ]
          );
          vid = vRes[0].id;
          savedStock = vRes[0].stock_quantity;
          variantIds.push({ id: vid, stock: savedStock });
          console.log(
            `  Variant: ${variantName} -> ${vid} (stock ${savedStock})`
          );
          totalColorVariants++;
          // stop creating new color variants if we've reached the target across all products
          if (totalColorVariants >= TARGET_TOTAL_COLOR_VARIANTS) {
            // if we reached the target, skip remaining colors for subsequent products
            // but still allow review seeding
          }
        } else {
          const supa = pool;
          // Use upsert on sku
          const payload = {
            product_id: productId,
            name: variantName,
            sku,
            price: p.price,
            stock_quantity: variantStock,
            attributes: JSON.parse(attr),
            images: [p.image],
            is_active: true,
          };
          const { data, error } = await supa
            .from("product_variants")
            .upsert(payload, { onConflict: "sku" })
            .select("id,stock_quantity");
          if (error) throw error;
          vid = data[0].id;
          savedStock = data[0].stock_quantity;
          variantIds.push({ id: vid, stock: savedStock });
          console.log(
            `  Variant: ${variantName} -> ${vid} (stock ${savedStock})`
          );
          totalColorVariants++;
        }

        // collect color to later write into product.specifications
        if (color) collectedColors.push(color);

        // Create stock_alert if low
        const threshold = 5;
        if (savedStock <= threshold) {
          if (client && client.query) {
            await client.query(
              `INSERT INTO stock_alerts (product_id, variant_id, warehouse_id, alert_type, threshold_value, current_value)
               VALUES ($1,$2,$3,$4,$5,$6)`,
              [productId, vid, warehouseId, "low_stock", threshold, savedStock]
            );
          } else {
            const supa = pool;
            const { error } = await supa.from("stock_alerts").insert({
              product_id: productId,
              variant_id: vid,
              warehouse_id: warehouseId,
              alert_type: "low_stock",
              threshold_value: threshold,
              current_value: savedStock,
            });
            if (error) throw error;
          }
          console.log(
            `    Created stock_alert for variant ${vid} (stock ${savedStock})`
          );
        }
      }

      // Update product level stock_quantity to sum of variants
      const totalStock = variantIds.reduce((s, v) => s + (v.stock || 0), 0);
      if (client && client.query) {
        await client.query(
          `UPDATE products SET stock_quantity = $1 WHERE id = $2`,
          [totalStock, productId]
        );
      } else {
        const supa = pool;
        const { error } = await supa
          .from("products")
          .update({ stock_quantity: totalStock })
          .eq("id", productId);
        if (error) throw error;
      }
      console.log(
        `  Updated product ${productId} stock_quantity=${totalStock}`
      );
      // Write aggregated specifications (available colors, sizes if any)
      try {
        const uniqueColors = Array.from(
          new Set(collectedColors.map((c) => (c || "").toString()))
        ).filter(Boolean);
        if (uniqueColors.length > 0) {
          if (client && client.query) {
            // read existing specifications
            const specRes = await client.query(
              `SELECT specifications FROM products WHERE id = $1 LIMIT 1`,
              [productId]
            );
            const existingSpec =
              (specRes[0] && specRes[0].specifications) || {};
            const merged = Object.assign({}, existingSpec, {
              available_colors: uniqueColors,
              available_sizes: existingSpec.available_sizes || DEFAULT_SIZES,
            });
            await client.query(
              `UPDATE products SET specifications = $1 WHERE id = $2`,
              [JSON.stringify(merged), productId]
            );
          } else {
            const supa = pool;
            // fetch existing specifications to merge
            const { data: prodData, error: selErr } = await supa
              .from("products")
              .select("specifications")
              .eq("id", productId)
              .limit(1)
              .single();
            if (selErr) throw selErr;
            const existingSpec = (prodData && prodData.specifications) || {};
            const merged = Object.assign({}, existingSpec, {
              available_colors: uniqueColors,
              available_sizes: existingSpec.available_sizes || DEFAULT_SIZES,
            });
            const { error: updErr } = await supa
              .from("products")
              .update({ specifications: merged })
              .eq("id", productId);
            if (updErr) throw updErr;
          }
          console.log(
            `  Wrote specifications.available_colors for product ${productId}`
          );
        }
      } catch (e) {
        console.warn(
          `Failed to update specifications for product ${productId}:`,
          e.message || e
        );
      }

      // Create fake reviews for this product
      try {
        const reviewCount =
          REVIEWS_PER_PRODUCT_MIN +
          Math.floor(
            Math.random() *
              (REVIEWS_PER_PRODUCT_MAX - REVIEWS_PER_PRODUCT_MIN + 1)
          );
        for (let r = 0; r < reviewCount; r++) {
          const reviewer =
            fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
          const rating = 1 + Math.floor(Math.random() * 5);
          const title = `Review ${r + 1} for ${p.name}`;
          const comment = `This is an auto-generated review (${rating} stars).`;
          const isVerified = Math.random() > 0.5;
          const isApproved = true;
          const helpful = Math.floor(Math.random() * 20);

          if (client && client.query) {
            await client.query(
              `INSERT INTO reviews (product_id, user_id, rating, title, comment, images, is_verified_purchase, is_approved, helpful_count, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, now(), now())`,
              [
                productId,
                reviewer,
                rating,
                title,
                comment,
                JSON.stringify([]),
                isVerified,
                isApproved,
                helpful,
              ]
            );
          } else {
            const supa = pool;
            const { error } = await supa.from("reviews").insert({
              product_id: productId,
              user_id: reviewer,
              rating,
              title,
              comment,
              images: [],
              is_verified_purchase: isVerified,
              is_approved: isApproved,
              helpful_count: helpful,
            });
            if (error) throw error;
          }
        }
      } catch (e) {
        console.warn(
          `Failed to insert reviews for product ${productId}:`,
          e.message || e
        );
      }
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    if (client && client.release) {
      try {
        client.release();
      } catch (e) {
        // ignore
      }
    }
    // If we used a pg Pool, close it gracefully
    if (isPg && pool && typeof pool.end === "function") {
      try {
        await pool.end();
      } catch (e) {
        // ignore
      }
    }
    process.exit(0);
  }
}

seed();
