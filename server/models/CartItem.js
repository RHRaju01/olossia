import { pool } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

export class CartItem {
  // Add or increment an item for a user (upsert semantics)
  static async addItem({
    userId,
    product_id,
    variant_id = null,
    quantity = 1,
  }) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (user_id, product_id, variant_id)
           DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = now()
           RETURNING *`,
          [userId, product_id, variant_id, quantity]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase client
      const { data, error } = await pool
        .from("cart_items")
        .upsert(
          {
            user_id: userId,
            product_id,
            variant_id,
            quantity,
          },
          { onConflict: "user_id,product_id,variant_id" }
        )
        .select();
      if (error) throw error;
      // Supabase may return an array
      return Array.isArray(data) ? data[0] : data;
    }
  }

  static async updateItem(itemId, update) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE cart_items SET quantity = $1, updated_at = now() WHERE id = $2 RETURNING *`,
          [update.quantity, itemId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("cart_items")
        .update({ quantity: update.quantity })
        .eq("id", itemId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  static async removeItem(itemId) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `DELETE FROM cart_items WHERE id = $1 RETURNING *`,
          [itemId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("cart_items")
        .delete()
        .eq("id", itemId)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }

  static async clearCart(userId) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [
          userId,
        ]);
        return true;
      } finally {
        client.release();
      }
    } else {
      const { error } = await pool
        .from("cart_items")
        .delete()
        .eq("user_id", userId);
      if (error) throw error;
      return true;
    }
  }

  static async getByUser(userId) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT ci.*,
                  p.name as product_name, p.price as product_price, p.images as product_images
           FROM cart_items ci
           LEFT JOIN products p ON ci.product_id = p.id
           WHERE ci.user_id = $1
           ORDER BY ci.created_at DESC`,
          [userId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("cart_items")
        .select(`*, products(*)`)
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    }
  }

  // Bulk merge: perform upsert for multiple guest items atomically (Postgres transaction)
  static async bulkMerge(userId, items = []) {
    if (!Array.isArray(items) || items.length === 0) return [];

    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const merged = [];
        for (const it of items) {
          const { product_id, variant_id = null, quantity = 1 } = it;
          const res = await client.query(
            `INSERT INTO cart_items (user_id, product_id, variant_id, quantity)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, product_id, variant_id)
             DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = now()
             RETURNING *`,
            [userId, product_id, variant_id, quantity]
          );
          merged.push(res.rows[0]);
        }
        await client.query("COMMIT");
        return merged;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    } else {
      // Supabase: perform upserts in a loop (no direct transaction here)
      const merged = [];
      for (const it of items) {
        const { product_id, variant_id = null, quantity = 1 } = it;
        const { data, error } = await pool
          .from("cart_items")
          .upsert(
            {
              user_id: userId,
              product_id,
              variant_id,
              quantity,
            },
            { onConflict: "user_id,product_id,variant_id" }
          )
          .select();
        if (error) throw error;
        merged.push(Array.isArray(data) ? data[0] : data);
      }
      return merged;
    }
  }
}
