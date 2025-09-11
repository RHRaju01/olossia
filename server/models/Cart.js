import { pool } from "../config/database.js";
import { supabase } from "../config/supabase.js";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

export class Cart {
  // Add item to cart
  static async addItem(userId, productId, quantity = 1) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO carts (user_id, product_id, quantity) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (user_id, product_id) 
           DO UPDATE SET quantity = carts.quantity + $3, updated_at = NOW()
           RETURNING *`,
          [userId, productId, quantity]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      try {
        // First check if item exists
        const { data: existingItem } = await supabase
          .from("carts")
          .select("*")
          .eq("user_id", userId)
          .eq("product_id", productId)
          .single();

        if (existingItem) {
          // Update quantity
          const { data, error } = await supabase
            .from("carts")
            .update({
              quantity: existingItem.quantity + quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("product_id", productId)
            .select()
            .single();

          if (error) throw error;
          return data;
        } else {
          // Insert new item
          const { data, error } = await supabase
            .from("carts")
            .insert({
              user_id: userId,
              product_id: productId,
              quantity,
            })
            .select()
            .single();

          if (error) throw error;
          return data;
        }
      } catch (error) {
        if (
          error.code === "PGRST116" ||
          error.message.includes('relation "carts" does not exist')
        ) {
          throw new Error(
            "Cart table does not exist. Please create the carts table in your database."
          );
        }
        throw error;
      }
    }
  }

  // Get user's cart items
  static async getCartItems(userId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT c.*, p.name, p.price, p.images, p.slug
           FROM carts c
           JOIN products p ON c.product_id = p.id
           WHERE c.user_id = $1
           ORDER BY c.created_at DESC`,
          [userId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("carts")
        .select(
          `
          *,
          products (
            id, name, price, images, slug, stock_quantity
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  }

  // Update item quantity
  static async updateQuantity(userId, productId, quantity) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE carts SET quantity = $1, updated_at = NOW()
           WHERE user_id = $2 AND product_id = $3
           RETURNING *`,
          [quantity, userId, productId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("carts")
        .update({
          quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("product_id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Remove item from cart
  static async removeItem(userId, productId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `DELETE FROM carts WHERE user_id = $1 AND product_id = $2 RETURNING *`,
          [userId, productId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Clear entire cart
  static async clearCart(userId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `DELETE FROM carts WHERE user_id = $1 RETURNING *`,
          [userId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("carts")
        .delete()
        .eq("user_id", userId)
        .select();

      if (error) throw error;
      return data;
    }
  }
}
