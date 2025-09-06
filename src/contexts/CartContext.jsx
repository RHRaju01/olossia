import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { cartAPI } from '../services/api/cartAPI';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload,
        loading: false
      };
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.product_id === action.payload.product_id && 
                item.variant_id === action.payload.variant_id
      );
      
      if (existingItemIndex >= 0) {
        // Don't add if item already exists, just return current state
        return state;
      }
      
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated, user } = useAuth();

  // Load cart items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Mock cart items for demo (replace with API calls later)
      const mockItems = [
        {
          id: 1,
          product_id: 'silk-midi-dress',
          name: "Silk Midi Dress",
          brand: "ZARA",
          price: 129,
          originalPrice: 189,
          quantity: 1,
          size: "M",
          color: "Black",
          image: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=200"
        },
        {
          id: 2,
          product_id: 'premium-cotton-blazer',
          name: "Premium Cotton Blazer",
          brand: "H&M",
          price: 89,
          quantity: 2,
          size: "L",
          color: "Navy",
          image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=200"
        }
      ];
      dispatch({ type: 'SET_ITEMS', payload: mockItems });
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const addItem = useCallback(async (product, quantity = 1, size = 'M', color = 'Default') => {
    try {
      const cartItem = {
        id: Date.now(), // Mock ID
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        quantity,
        size,
        color,
        image: product.image
      };

      dispatch({ type: 'ADD_ITEM', payload: cartItem });
      return { success: true };
    } catch (error) {
      const message = 'Failed to add item to cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      dispatch({ type: 'UPDATE_ITEM', payload: { id: itemId, quantity } });
      return { success: true };
    } catch (error) {
      const message = 'Failed to update item';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      return { success: true };
    } catch (error) {
      const message = 'Failed to remove item';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      dispatch({ type: 'CLEAR_CART' });
      return { success: true };
    } catch (error) {
      const message = 'Failed to clear cart';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const isInCart = useCallback((productId) => {
    return state.items.some(item => item.product_id === productId);
  }, [state.items]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = state.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      subtotal,
      itemCount,
      shipping: subtotal > 100 ? 0 : 10, // Free shipping over $100
      total: subtotal + (subtotal > 100 ? 0 : 10)
    };
  }, [state.items]);


  const value = useMemo(() => ({
    ...state,
    totals,
    isInCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
  }), [state, totals, isInCart, addItem, updateItem, removeItem, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  return context;
};