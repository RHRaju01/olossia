import { createSlice, createSelector } from "@reduxjs/toolkit";

/**
 * Initial state for the cart slice
 * Mirrors the structure from CartContext for seamless migration
 */
const initialState = {
  items: [],
  loading: false,
  error: null,
};

/**
 * Cart Redux Slice
 * Handles all cart state management with Redux Toolkit
 */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Set all cart items (e.g., after fetching from API)
    setItems: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add item to cart
    addItem: (state, action) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.product_id === newItem.product_id &&
          item.variant_id === newItem.variant_id
      );

      if (existingItemIndex >= 0) {
        // Don't add if item already exists, just return current state
        return;
      }

      state.items.push(newItem);
      state.error = null;
    },

    // Update item quantity
    updateItem: (state, action) => {
      const { id, quantity } = action.payload;
      const itemIndex = state.items.findIndex((item) => item.id === id);

      if (itemIndex >= 0) {
        state.items[itemIndex].quantity = quantity;
        state.error = null;
      }
    },

    // Remove item from cart
    removeItem: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      state.error = null;
    },

    // Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.error = null;
    },

    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setLoading,
  setItems,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  setError,
  clearError,
} = cartSlice.actions;

// Selectors for accessing cart state
export const selectCartItems = (state) => state.cart.items;
export const selectCartLoading = (state) => state.cart.loading;
export const selectCartError = (state) => state.cart.error;

// Memoized computed selectors using createSelector for performance
export const selectCartTotals = createSelector([selectCartItems], (items) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100

  return {
    subtotal,
    itemCount,
    shipping,
    total: subtotal + shipping,
  };
});

export const selectIsInCart = createSelector(
  [selectCartItems],
  (items) => (productId) => {
    return items.some((item) => item.product_id === productId);
  }
);

// Export the reducer as default
export default cartSlice.reducer;
