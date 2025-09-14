import { supabase } from '../config/supabase.js';

export class Product {
  static async create(productData) {
    const {
      name, description, price, brandId, categoryId, 
      sku, stockQuantity, images, specifications, sellerId
    } = productData;

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price,
        brand_id: brandId,
        category_id: categoryId,
        sku,
        stock_quantity: stockQuantity,
        images: images || [],
        specifications: specifications || {},
        seller_id: sellerId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands!inner(name),
        categories!inner(name),
        users(first_name, last_name)
      `)
      .eq('id', id)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;
    
    return {
      ...data,
      brand_name: data.brands.name,
      category_name: data.categories.name,
      seller_name: data.users ? `${data.users.first_name} ${data.users.last_name}` : null
    };
  }

  static async getAll(filters = {}) {
    let query = supabase
      .from('products')
      .select(`
        *,
        brands!inner(name),
        categories!inner(name),
        reviews(rating)
      `)
      .eq('status', 'active');

    // Apply filters
    if (filters.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }

    if (filters.brandId) {
      query = query.eq('brand_id', filters.brandId);
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // Apply ordering and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map(product => ({
      ...product,
      brand_name: product.brands.name,
      category_name: product.categories.name,
      avg_rating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
        : 0,
      review_count: product.reviews.length
    }));
  }

  static async updateStock(id, quantity) {
    // First check current stock
    const { data: currentProduct } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', id)
      .single();
    
    if (!currentProduct || currentProduct.stock_quantity < quantity) {
      throw new Error('Insufficient stock');
    }
    
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock_quantity: currentProduct.stock_quantity - quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('stock_quantity')
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getFeatured(limit = 6) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands!inner(name),
        categories!inner(name),
        reviews(rating)
      `)
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map(product => ({
      ...product,
      brand_name: product.brands.name,
      category_name: product.categories.name,
      avg_rating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length 
        : 0,
      review_count: product.reviews.length
    }));
  }
}