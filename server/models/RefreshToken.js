import { dbQuery, pool } from "../config/database.js";
import { hashRefreshToken, compareRefreshToken } from "../utils/encryption.js";
import { generateRandomToken } from "../utils/jwt.js";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || "supabase";

export class RefreshToken {
  // Create and store a hashed refresh token. Returns the plain token and DB row.
  static async create({
    userId,
    ipAddress = null,
    userAgent = null,
    expiresInSeconds = 60 * 60 * 24 * 30,
  }) {
    const plain = generateRandomToken(48); // base64url
    const tokenHash = hashRefreshToken(plain);
    const expiresAt = new Date(
      Date.now() + expiresInSeconds * 1000
    ).toISOString();

    if (DATABASE_TYPE === "postgresql") {
      const client = await pool.connect();
      try {
        const result = await client.query(
          `INSERT INTO public.refresh_tokens (user_id, token_hash, ip_address, user_agent, is_revoked, created_at, expires_at)
           VALUES ($1,$2,$3,$4,false, now(), $5)
           RETURNING *`,
          [userId, tokenHash, ipAddress, userAgent, expiresAt]
        );
        return { token: plain, row: result.rows[0] };
      } finally {
        client.release();
      }
    } else {
      const { data, error } = await pool
        .from("refresh_tokens")
        .insert({
          user_id: userId,
          token_hash: tokenHash,
          ip_address: ipAddress,
          user_agent: userAgent,
          is_revoked: false,
          expires_at: expiresAt,
        })
        .select("*")
        .single();

      if (error) throw error;
      return { token: plain, row: data };
    }
  }

  // Find a refresh token row by raw token (compare hashes)
  static async findByToken(rawToken) {
    const tokenHash = hashRefreshToken(rawToken);
    if (DATABASE_TYPE === "postgresql") {
      const sql = `select * from public.refresh_tokens where token_hash = $1 limit 1`;
      const rows = await dbQuery(sql, [tokenHash]);
      return rows[0] || null;
    } else {
      // Supabase client path
      const { data, error } = await pool
        .from("refresh_tokens")
        .select("*")
        .eq("token_hash", tokenHash)
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      return data || null;
    }
  }

  // Revoke a token by its DB id / hash
  static async revokeById(id) {
    if (DATABASE_TYPE === "postgresql") {
      const sql = `update public.refresh_tokens set is_revoked = true, last_used_at = now() where id = $1 returning *`;
      const rows = await dbQuery(sql, [id]);
      return rows[0] || null;
    } else {
      // Supabase client path
      const { data, error } = await pool
        .from("refresh_tokens")
        .update({ is_revoked: true, last_used_at: new Date().toISOString() })
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data || null;
    }
  }

  // Prune expired tokens (optional cleanup)
  static async pruneExpired() {
    if (DATABASE_TYPE === "postgresql") {
      const sql = `delete from public.refresh_tokens where expires_at < now()`;
      await dbQuery(sql);
      return true;
    } else {
      // Supabase client path
      const { error } = await pool
        .from("refresh_tokens")
        .delete()
        .lt("expires_at", new Date().toISOString());
      if (error) throw error;
      return true;
    }
  }
}

export default RefreshToken;
