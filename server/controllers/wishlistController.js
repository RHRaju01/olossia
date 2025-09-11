import { Wishlist } from "../models/Wishlist.js";

export const wishlistController = {
  // Add item to wishlist
  addToWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      console.log("❤️ Add to wishlist request:", { userId, productId });

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const wishlistItem = await Wishlist.addItem(userId, productId);

      res.status(201).json({
        success: true,
        message: "Item added to wishlist successfully",
        data: wishlistItem,
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      res.status(500).json({
        success: false,
        message: "Failed to add item to wishlist",
      });
    }
  },

  // Get wishlist items
  getWishlist: async (req, res) => {
    try {
      const userId = req.user.id;
      const wishlistItems = await Wishlist.getWishlistItems(userId);

      res.json({
        success: true,
        data: {
          items: wishlistItems,
          totalItems: wishlistItems.length,
        },
      });
    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch wishlist items",
      });
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const removedItem = await Wishlist.removeItem(userId, productId);

      if (!removedItem) {
        return res.status(404).json({
          success: false,
          message: "Wishlist item not found",
        });
      }

      res.json({
        success: true,
        message: "Item removed from wishlist successfully",
        data: removedItem,
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove item from wishlist",
      });
    }
  },

  // Toggle item in wishlist (add if not exists, remove if exists)
  toggleWishlist: async (req, res) => {
    try {
      const { productId } = req.body;
      const userId = req.user.id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      // Check if item is already in wishlist
      const isInWishlist = await Wishlist.isInWishlist(userId, productId);

      if (isInWishlist) {
        // Remove from wishlist
        const removedItem = await Wishlist.removeItem(userId, productId);
        res.json({
          success: true,
          message: "Item removed from wishlist",
          data: { action: "removed", item: removedItem },
        });
      } else {
        // Add to wishlist
        const addedItem = await Wishlist.addItem(userId, productId);
        res.status(201).json({
          success: true,
          message: "Item added to wishlist",
          data: { action: "added", item: addedItem },
        });
      }
    } catch (error) {
      console.error("Toggle wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle wishlist item",
      });
    }
  },

  // Clear entire wishlist
  clearWishlist: async (req, res) => {
    try {
      const userId = req.user.id;
      const removedItems = await Wishlist.clearWishlist(userId);

      res.json({
        success: true,
        message: "Wishlist cleared successfully",
        data: { removedCount: removedItems.length },
      });
    } catch (error) {
      console.error("Clear wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear wishlist",
      });
    }
  },
};
