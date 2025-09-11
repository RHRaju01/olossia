import { pool } from "../config/database.js";
import { supabase } from "../config/supabase.js";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

export class Wishlist {
  // Add item to wishlist
  static async addItem(userId, productId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO wishlists (user_id, product_id) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, product_id) DO NOTHING
           RETURNING *`,
          [userId, productId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      try {
        const { data, error } = await supabase
          .from("wishlists")
          .insert({
            user_id: userId,
            product_id: productId,
          })
          .select()
          .single();

        if (error && error.code !== "23505") throw error; // Ignore duplicate key error
        return data;
      } catch (error) {
        if (
          error.code === "PGRST116" ||
          error.message.includes('relation "wishlists" does not exist')
        ) {
          throw new Error(
            "Wishlist table does not exist. Please create the wishlists table in your database."
          );
        }
        throw error;
      }
    }
  }

  // Get user's wishlist items
  static async getWishlistItems(userId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT w.*, p.name, p.price, p.images, p.slug, p.description
           FROM wishlists w
           JOIN products p ON w.product_id = p.id
           WHERE w.user_id = $1
           ORDER BY w.created_at DESC`,
          [userId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("wishlists")
        .select(
          `
          *,
          products (
            id, name, price, images, slug, description, stock_quantity
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    }
  }

  // Remove item from wishlist
  static async removeItem(userId, productId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2 RETURNING *`,
          [userId, productId]
        );
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  }

  // Check if item is in wishlist
  static async isInWishlist(userId, productId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT EXISTS(SELECT 1 FROM wishlists WHERE user_id = $1 AND product_id = $2)`,
          [userId, productId]
        );
        return result.rows[0].exists;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("wishlists")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return !!data;
    }
  }

  // Clear entire wishlist
  static async clearWishlist(userId) {
    if (DATABASE_TYPE === "postgresql") {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `DELETE FROM wishlists WHERE user_id = $1 RETURNING *`,
          [userId]
        );
        return result.rows;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", userId)
        .select();

      if (error) throw error;
      return data;
    }
  }
}
