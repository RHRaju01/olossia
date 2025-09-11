import { Cart } from "../models/Cart.js";

export const cartController = {
  // Add item to cart
  addToCart: async (req, res) => {
    try {
      const { productId, quantity = 1 } = req.body;
      const userId = req.user.id;

      console.log("🛒 Add to cart request:", { userId, productId, quantity });

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is required",
        });
      }

      const cartItem = await Cart.addItem(userId, productId, quantity);

      res.status(201).json({
        success: true,
        message: "Item added to cart successfully",
        data: cartItem,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      res.status(500).json({
        success: false,
        message: "Failed to add item to cart",
      });
    }
  },

  // Get cart items
  getCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const cartItems = await Cart.getCartItems(userId);

      res.json({
        success: true,
        data: {
          items: cartItems,
          totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: cartItems.reduce((sum, item) => {
            const price = item.products ? item.products.price : item.price;
            return sum + price * item.quantity;
          }, 0),
        },
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch cart items",
      });
    }
  },

  // Update item quantity
  updateQuantity: async (req, res) => {
    try {
      const { productId } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required",
        });
      }

      const updatedItem = await Cart.updateQuantity(
        userId,
        productId,
        quantity
      );

      if (!updatedItem) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      res.json({
        success: true,
        message: "Cart item updated successfully",
        data: updatedItem,
      });
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update cart item",
      });
    }
  },

  // Remove item from cart
  removeFromCart: async (req, res) => {
    try {
      const { productId } = req.params;
      const userId = req.user.id;

      const removedItem = await Cart.removeItem(userId, productId);

      if (!removedItem) {
        return res.status(404).json({
          success: false,
          message: "Cart item not found",
        });
      }

      res.json({
        success: true,
        message: "Item removed from cart successfully",
        data: removedItem,
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove item from cart",
      });
    }
  },

  // Clear entire cart
  clearCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const removedItems = await Cart.clearCart(userId);

      res.json({
        success: true,
        message: "Cart cleared successfully",
        data: { removedCount: removedItems.length },
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear cart",
      });
    }
  },
};
