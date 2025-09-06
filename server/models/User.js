import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_TYPE = process.env.DATABASE_TYPE || 'supabase';

export class User {
  static async create({ email, password, firstName, lastName, roleId = null }) {
    if (DATABASE_TYPE === 'postgresql') {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        // Get customer role ID if not provided
        let finalRoleId = roleId;
        if (!finalRoleId) {
          const roleResult = await client.query(
            'SELECT id FROM roles WHERE name = $1',
            ['customer']
          );
          finalRoleId = roleResult.rows[0]?.id;
        }
        
        const result = await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role_id) 
           VALUES ($1, $2, $3, $4, $5) 
           RETURNING id, email, first_name, last_name, created_at`,
          [email, password, firstName, lastName, finalRoleId]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      let finalRoleId = roleId;
      if (!finalRoleId) {
        const { data: roleData } = await pool
          .from('roles')
          .select('id')
          .eq('name', 'customer')
          .single();
        finalRoleId = roleData?.id;
      }
      
      const { data, error } = await pool
        .from('users')
        .insert({
          email,
          password_hash: password,
          first_name: firstName,
          last_name: lastName,
          role_id: finalRoleId
        })
        .select('id, email, first_name, last_name, created_at')
        .single();
      
      if (error) throw error;
      return data;
    }
  }

  static async findByEmail(email) {
    if (DATABASE_TYPE === 'postgresql') {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT u.*, r.name as role_name 
           FROM users u 
           INNER JOIN roles r ON u.role_id = r.id 
           WHERE u.email = $1`,
          [email]
        );
        
        const user = result.rows[0];
        return user ? { ...user, role: user.role_name } : null;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await pool
        .from('users')
        .select(`
          *,
          roles!inner(name)
        `)
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? { ...data, role: data.roles.name } : null;
    }
  }

  static async findById(id) {
    if (DATABASE_TYPE === 'postgresql') {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT u.id, u.email, u.first_name, u.last_name, u.status, u.created_at, r.name as role_name
           FROM users u 
           INNER JOIN roles r ON u.role_id = r.id 
           WHERE u.id = $1`,
          [id]
        );
        
        const user = result.rows[0];
        return user ? { ...user, role: user.role_name } : null;
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await pool
        .from('users')
        .select(`
          id, email, first_name, last_name, status, created_at,
          roles!inner(name)
        `)
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data ? { ...data, role: data.roles.name } : null;
    }
  }

  static async updateLastLogin(id) {
    if (DATABASE_TYPE === 'postgresql') {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        await client.query(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
          [id]
        );
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { error } = await pool
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    }
  }

  static async updateStatus(id, status) {
    if (DATABASE_TYPE === 'postgresql') {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2 
           RETURNING id, email, first_name, last_name, status`,
          [status, id]
        );
        
        return result.rows[0];
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await pool
        .from('users')
        .update({ 
          status, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select('id, email, first_name, last_name, status')
        .single();
      
      if (error) throw error;
      return data;
    }
  }

  static async getAll(limit = 50, offset = 0) {
    if (DATABASE_TYPE === 'postgresql') {
      // PostgreSQL implementation
      const client = await pool.connect();
      try {
        const result = await client.query(
          `SELECT u.id, u.email, u.first_name, u.last_name, u.status, u.created_at, r.name as role_name
           FROM users u 
           INNER JOIN roles r ON u.role_id = r.id 
           ORDER BY u.created_at DESC 
           LIMIT $1 OFFSET $2`,
          [limit, offset]
        );
        
        return result.rows.map(user => ({ ...user, role: user.role_name }));
      } finally {
        client.release();
      }
    } else {
      // Supabase implementation
      const { data, error } = await pool
        .from('users')
        .select(`
          id, email, first_name, last_name, status, created_at,
          roles!inner(name)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data.map(user => ({ ...user, role: user.roles.name }));
    }
  }
}