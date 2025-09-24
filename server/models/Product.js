import { pool } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

export class Product {
  static async create(productData) {
    const {
      name,
      description,
      price,
      brandId,
      categoryId,
      sku,
      stockQuantity,
      images,
      specifications,
      sellerId,
    } = productData;

    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO products (name, slug, description, price, brand_id, category_id, sku, stock_quantity, images, specifications, seller_id) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
           RETURNING *`,
          [
            name,
            name.toLowerCase().replace(/\s+/g, "-"),
            description,
            price,
            brandId,
            categoryId,
            sku,
            stockQuantity,
            JSON.stringify(images || []),
            JSON.stringify(specifications || {}),
            sellerId,
          ]
        );

        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await pool
        .from("products")
        .insert({
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          description,
          price,
          brand_id: brandId,
          category_id: categoryId,
          sku,
          stock_quantity: stockQuantity,
          images: images || [],
          specifications: specifications || {},
          seller_id: sellerId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async findById(id) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT p.*, b.name as brand_name, c.name as category_name, 
                    u.first_name, u.last_name
             FROM products p
             LEFT JOIN brands b ON p.brand_id = b.id
             LEFT JOIN categories c ON p.category_id = c.id
             LEFT JOIN users u ON p.seller_id = u.id
             WHERE p.id = $1 AND p.status = 'active'`,
          [id]
        );

        const product = result.rows[0];
        if (!product) return null;

        return {
          ...product,
          seller_name: product.first_name
            ? `${product.first_name} ${product.last_name}`
            : null,
        };
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await pool
        .from("products")
        .select(
          `
          *,
          brands(name),
          categories(name),
          users(first_name, last_name)
        `
        )
        .eq("id", id)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;

      return {
        ...data,
        brand_name: data.brands ? data.brands.name : null,
        category_name: data.categories ? data.categories.name : null,
        seller_name: data.users
          ? `${data.users.first_name} ${data.users.last_name}`
          : null,
      };
    }
  }

  static async getAll(filters = {}) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        let query = `
          SELECT p.*, b.name as brand_name, c.name as category_name,
                 COALESCE(AVG(r.rating), 0) as avg_rating,
                 COUNT(r.id) as review_count
          FROM products p
          LEFT JOIN brands b ON p.brand_id = b.id
          LEFT JOIN categories c ON p.category_id = c.id
          LEFT JOIN reviews r ON p.id = r.product_id
          WHERE p.status = 'active'
        `;

        const params = [];
        let paramCount = 0;

        // Apply filters
        if (filters.categoryId) {
          paramCount++;
          query += ` AND p.category_id = $${paramCount}`;
          params.push(filters.categoryId);
        }

        if (filters.brandId) {
          paramCount++;
          query += ` AND p.brand_id = $${paramCount}`;
          params.push(filters.brandId);
        }

        if (filters.minPrice) {
          paramCount++;
          query += ` AND p.price >= $${paramCount}`;
          params.push(filters.minPrice);
        }

        if (filters.maxPrice) {
          paramCount++;
          query += ` AND p.price <= $${paramCount}`;
          params.push(filters.maxPrice);
        }

        if (filters.search) {
          paramCount++;
          query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
          params.push(`%${filters.search}%`);
        }

        query += ` GROUP BY p.id, b.name, c.name ORDER BY p.created_at DESC`;

        if (filters.limit) {
          paramCount++;
          query += ` LIMIT $${paramCount}`;
          params.push(filters.limit);
        }

        if (filters.offset) {
          paramCount++;
          query += ` OFFSET $${paramCount}`;
          params.push(filters.offset);
        }

        const result = await client.query(query, params);
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      let query = pool
        .from("products")
        .select(
          `
          *,
          brands(name),
          categories(name),
          reviews(rating),
          product_variants(id,sku,price,stock_quantity,attributes,images)
        `
        )
        .eq("status", "active");

      // Apply filters
      if (filters.categoryId) {
        query = query.eq("category_id", filters.categoryId);
      }

      if (filters.brandId) {
        query = query.eq("brand_id", filters.brandId);
      }

      if (filters.minPrice) {
        query = query.gte("price", filters.minPrice);
      }

      if (filters.maxPrice) {
        query = query.lte("price", filters.maxPrice);
      }

      if (filters.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Apply ordering and pagination
      query = query
        .order("created_at", { ascending: false })
        .range(
          filters.offset || 0,
          (filters.offset || 0) + (filters.limit || 20) - 1
        );

      const { data, error } = await query;

      if (error) throw error;

      return data.map((product) => ({
        ...product,
        brand_name: product.brands ? product.brands.name : null,
        category_name: product.categories ? product.categories.name : null,
        avg_rating:
          product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
            : 0,
        review_count: product.reviews.length,
      }));
    }
  }

  static async updateStock(id, quantity) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        // First check current stock
        const stockResult = await client.query(
          "SELECT stock_quantity FROM products WHERE id = $1",
          [id]
        );

        const currentProduct = stockResult.rows[0];
        if (!currentProduct || currentProduct.stock_quantity < quantity) {
          throw new Error("Insufficient stock");
        }

        const result = await client.query(
          `UPDATE products 
           SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 
           RETURNING stock_quantity`,
          [quantity, id]
        );

        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data: currentProduct } = await pool
        .from("products")
        .select("stock_quantity")
        .eq("id", id)
        .single();

      if (!currentProduct || currentProduct.stock_quantity < quantity) {
        throw new Error("Insufficient stock");
      }

      const { data, error } = await pool
        .from("products")
        .update({
          stock_quantity: currentProduct.stock_quantity - quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("stock_quantity")
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async getFeatured(limit = 6) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT p.*, b.name as brand_name, c.name as category_name,
                  COALESCE(AVG(r.rating), 0) as avg_rating,
                  COUNT(r.id) as review_count
           FROM products p
           INNER JOIN brands b ON p.brand_id = b.id
           INNER JOIN categories c ON p.category_id = c.id
           LEFT JOIN reviews r ON p.id = r.product_id
           WHERE p.status = 'active' AND p.is_featured = true
           GROUP BY p.id, b.name, c.name
           ORDER BY p.created_at DESC
           LIMIT $1`,
          [limit]
        );

        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await pool
        .from("products")
        .select(
          `
          *,
          brands!inner(name),
          categories!inner(name),
          reviews(rating),
          product_variants(id,sku,price,stock_quantity,attributes,images)
        `
        )
        .eq("status", "active")
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map((product) => ({
        ...product,
        brand_name: product.brands.name,
        category_name: product.categories.name,
        avg_rating:
          product.reviews.length > 0
            ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
              product.reviews.length
            : 0,
        review_count: product.reviews.length,
      }));
    }
  }
}
