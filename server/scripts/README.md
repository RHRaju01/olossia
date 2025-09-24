Seed products, brands, categories, variants and stock alerts

## Usage

1. Ensure your environment variables provide a direct DB connection (DATABASE_URL or SUPABASE_DB_URL) and that `server/config/database.js` selects `pg Pool` (see DATABASE_TYPE). The seeder runs raw SQL and requires direct DB access.

2. Run from project root:

```powershell
node server/scripts/seed-products.js
```

## What it does

- Creates brands and categories if missing (based on names in the mock data).
- Inserts products (slug derived from mock id/name) with `status='active'` and `images` set as JSON arrays.
- Creates one `product_variants` row per color with randomized stock (0–50).
- Creates a default warehouse if none exists and inserts `stock_alerts` for variants with stock <= 5.

## Notes

- The script must run with DB credentials that bypass RLS (server-side admin connection) or in a context that allows inserts into these tables.
- Running the script multiple times is mostly idempotent for brands/categories and will upsert variants by SKU.
- The script will update product-level `stock_quantity` to the sum of its variant stocks.
