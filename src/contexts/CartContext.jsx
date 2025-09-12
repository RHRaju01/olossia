import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import cartAPI from '../services/api/cartAPI';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        return {
          ...state,
          items: state.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.product_id === action.payload.product_id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== action.payload),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCartItems();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const loadCartItems = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.getItems();
      if (response.success) {
        dispatch({ type: 'SET_ITEMS', payload: response.data.items });
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await cartAPI.addItem(product.id, quantity);
        if (response.success) {
          // Reload cart items to get updated data
          await loadCartItems();
          return { success: true };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to add item to cart',
          };
        }
      } catch (error) {
        console.error('Error adding item to cart:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [loadCartItems]
  );

  const updateItem = useCallback(
    async (productId, quantity) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await cartAPI.updateItem(productId, quantity);
        if (response.success) {
          await loadCartItems();
        }
      } catch (error) {
        console.error('Error updating cart item:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [loadCartItems]
  );

  const removeItem = useCallback(
    async productId => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await cartAPI.removeItem(productId);
        if (response.success) {
          await loadCartItems();
        }
      } catch (error) {
        console.error('Error removing cart item:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [loadCartItems]
  );

  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await cartAPI.clearCart();
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const totalItems = state.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const subtotal = state.items.reduce((sum, item) => {
      const price = item.products ? item.products.price : item.price || 0;
      return sum + price * (item.quantity || 0);
    }, 0);

    // Calculate shipping (free shipping over $100)
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + shipping;

    return {
      totalItems,
      totalPrice: subtotal, // Keep this for backward compatibility
      subtotal,
      shipping,
      total,
      itemCount: state.items.length,
    };
  }, [state.items]);

  const value = {
    ...state,
    ...totals,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    clearError,
    loadCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
