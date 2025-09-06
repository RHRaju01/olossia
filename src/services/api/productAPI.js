import apiClient from './client';

export const productAPI = {
  // Get all products with filters
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
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
    return response.data;
  },

  // Search products
  searchProducts: async (query, filters = {}) => {
    const response = await apiClient.get('/products', {
      params: { search: query, ...filters }
    });
    return response.data;
  }
};