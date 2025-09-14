import { supabase } from '../config/supabase.js';

export class User {
  static async create({ email, password, firstName, lastName, roleId = null }) {
    // Get customer role ID if not provided
    let finalRoleId = roleId;
    if (!finalRoleId) {
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'customer')
        .single();
      finalRoleId = roleData?.id;
    }
    
    const { data, error } = await supabase
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

  static async findByEmail(email) {
    const { data, error } = await supabase
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

  static async findById(id) {
    const { data, error } = await supabase
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

  static async updateLastLogin(id) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }

  static async updateStatus(id, status) {
    const { data, error } = await supabase
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

  static async getAll(limit = 50, offset = 0) {
    const { data, error } = await supabase
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