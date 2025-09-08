import apiClient from './client';

const productAPI = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product
  getProduct: async (id) => {
    try {
      if (!id) {
        throw new Error('Product ID is required');
      }
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 6) => {
    const response = await apiClient.get('/products/featured', { 
      params: { limit } 
    });
    return response.data;
  },

  // Create product (admin/seller only)
  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  // Update product (admin/seller only)
  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product (admin only)
  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/products/${id}`);
    try {
      const response = await apiClient.get(`/products/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }

  // Search products
  searchProducts: async (query, filters = {}) => {
    try {
    try {
      const response = await apiClient.get('/products/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching products:', error);
    try {
      const response = await apiClient.get('/products/trending');
      return response.data;
    } catch (error) {
      console.error('Error fetching trending products:', error);
      throw error;
    }
  }