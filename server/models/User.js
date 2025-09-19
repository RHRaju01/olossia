import { pool } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

export class User {
  // Create user (password should already be hashed by caller)
  static async create({ email, password, firstName, lastName, roleId = null }) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        let finalRoleId = roleId;
        if (!finalRoleId) {
          const roleResult = await client.query(
            "SELECT id FROM roles WHERE name = $1",
            ["customer"]
          );
          finalRoleId = roleResult.rows[0]?.id || null;
        }

        const result = await client.query(
          `INSERT INTO public.users (email, password_hash, first_name, last_name, role_id, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5, now(), now())
           RETURNING id, email, first_name, last_name, created_at`,
          [email, password, firstName, lastName, finalRoleId]
        );

        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase client
      const { data, error } = await pool
        .from("users")
        .insert({
          email,
          password_hash: password,
          first_name: firstName,
          last_name: lastName,
          role_id: roleId,
        })
        .select("id, email, first_name, last_name, created_at")
        .single();

      if (error) throw error;
      return data;
    }
  }

  static async findByEmail(email) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT u.*, r.name as role_name
           FROM public.users u
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE u.email = $1 LIMIT 1`,
          [email]
        );
        const user = result.rows[0] || null;
        if (user) user.role = user.role_name || null;
        return user;
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("users")
        .select(`*, roles!left(name)`)
        .eq("email", email)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;
      return { ...data, role: data.roles?.name || null };
    }
  }

  static async findById(id) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT u.id, u.email, u.first_name, u.last_name, u.status, u.created_at, r.name as role_name
           FROM public.users u
           LEFT JOIN roles r ON u.role_id = r.id
           WHERE u.id = $1 LIMIT 1`,
          [id]
        );
        const user = result.rows[0] || null;
        if (user) user.role = user.role_name || null;
        return user;
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("users")
        .select(
          `id, email, first_name, last_name, status, created_at, roles!left(name)`
        )
        .eq("id", id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;
      return { ...data, role: data.roles?.name || null };
    }
  }

  static async updateLastLogin(id) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE public.users SET last_login = now(), updated_at = now() WHERE id = $1 RETURNING *`,
          [id]
        );
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("users")
        .update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data || null;
    }
  }

  static async updateStatus(id, status) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE public.users SET status = $1, updated_at = now() WHERE id = $2 RETURNING id, email, first_name, last_name, status`,
          [status, id]
        );
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("users")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("id, email, first_name, last_name, status")
        .maybeSingle();

      if (error) throw error;
      return data || null;
    }
  }

  // Convenience: revoke all refresh tokens for a user
  static async revokeAllRefreshTokens(userId) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE public.refresh_tokens SET is_revoked = true, last_used_at = now() WHERE user_id = $1`,
          [userId]
        );
        return true;
      } finally {
        client.release();
      }
    } else {
      const { error } = await pool
        .from("refresh_tokens")
        .update({ is_revoked: true, last_used_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;
      return true;
    }
  }

  static async setEmailVerified(id, verified = true) {
    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE public.users SET email_verified = $1, status = CASE WHEN $1 THEN 'active'::user_status ELSE status END, updated_at = now() WHERE id = $2 RETURNING *`,
          [verified, id]
        );
        return result.rows[0] || null;
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("users")
        .update({
          email_verified: verified,
          status: verified ? "active" : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data || null;
    }
  }
}

export default User;
