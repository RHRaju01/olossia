import apiClient from './client';

export const cartAPI = {
  // Get cart items
  getItems: async () => {
    const response = await apiClient.get('/cart');
    return response.data;
  },

  // Add item to cart
  addItem: async (itemData) => {
    const response = await apiClient.post('/cart/items', itemData);
    return response.data;
  },

  // Update cart item
  updateItem: async (itemId, updateData) => {
    const response = await apiClient.put(`/cart/items/${itemId}`, updateData);
    return response.data;
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    const response = await apiClient.delete(`/cart/items/${itemId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
  }
};