import apiClient from "./client";

const wishlistAPI = {
  // Get wishlist items
  getItems: async () => {
    try {
      const response = await apiClient.get("/wishlist");
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }
  },

  // Add item to wishlist
  addItem: async (productId) => {
    try {
      const response = await apiClient.post("/wishlist/add", {
        productId,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding item to wishlist:", error);
      throw error;
    }
  },

  // Toggle item in wishlist (add if not exists, remove if exists)
  toggleItem: async (productId) => {
    try {
      const response = await apiClient.post("/wishlist/toggle", {
        productId,
      });
      return response.data;
    } catch (error) {
      console.error("Error toggling wishlist item:", error);
      throw error;
    }
  },

  // Remove item from wishlist
  removeItem: async (productId) => {
    try {
      const response = await apiClient.delete(`/wishlist/remove/${productId}`);
      return response.data;
    } catch (error) {
      console.error("Error removing wishlist item:", error);
      throw error;
    }
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    try {
      const response = await apiClient.delete("/wishlist/clear");
      return response.data;
    } catch (error) {
      console.error("Error clearing wishlist:", error);
      throw error;
    }
  },
};

export default wishlistAPI;
