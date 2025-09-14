import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
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
      const existingItem = state.items.find(item => item.product_id === action.payload.product_id);
      if (existingItem) {
        return state; // Item already in wishlist
      }
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case 'CLEAR_WISHLIST':
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

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Mock wishlist items for demo (replace with API calls later)
  useEffect(() => {
    if (isAuthenticated) {
      // Simulate loading wishlist items
      const mockItems = [
        {
          id: 1,
          product_id: 'vintage-denim-jacket',
          name: "Vintage Denim Jacket",
          brand: "LEVI'S",
          price: 159,
          originalPrice: 199,
          rating: 4.9,
          reviews: 203,
          image: "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=200",
          inStock: true,
          colors: ["#4169E1", "#000080", "#87CEEB"]
        },
        {
          id: 2,
          product_id: 'designer-silk-scarf',
          name: "Designer Silk Scarf",
          brand: "GUCCI",
          price: 399,
          rating: 5.0,
          reviews: 89,
          image: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=200",
          inStock: false,
          colors: ["#FFD700", "#FF6347", "#9370DB"]
        }
      ];
      dispatch({ type: 'SET_ITEMS', payload: mockItems });
    } else {
      dispatch({ type: 'CLEAR_WISHLIST' });
    }
  }, [isAuthenticated]);

  const addItem = useCallback(async (product) => {
    try {
      // Check if item already exists
      const existingItem = state.items.find(item => item.product_id === product.id);
      if (existingItem) {
        return { success: false, error: 'Item already in wishlist' };
      }

      const wishlistItem = {
        id: Date.now(), // Mock ID
        product_id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        originalPrice: product.originalPrice,
        rating: product.rating,
        reviews: product.reviews,
        image: product.image,
        inStock: true,
        colors: product.colors || []
      };

      dispatch({ type: 'ADD_ITEM', payload: wishlistItem });
      return { success: true };
    } catch (error) {
      const message = 'Failed to add item to wishlist';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, [state.items]);

  const removeItem = useCallback(async (itemId) => {
    try {
      dispatch({ type: 'REMOVE_ITEM', payload: itemId });
      return { success: true };
    } catch (error) {
      const message = 'Failed to remove item from wishlist';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const clearWishlist = useCallback(async () => {
    try {
      dispatch({ type: 'CLEAR_WISHLIST' });
      return { success: true };
    } catch (error) {
      const message = 'Failed to clear wishlist';
      dispatch({ type: 'SET_ERROR', payload: message });
      return { success: false, error: message };
    }
  }, []);

  const isInWishlist = useCallback((productId) => {
    return state.items.some(item => item.product_id === productId);
  }, [state.items]);

  const value = useMemo(() => ({
    ...state,
    addItem,
    removeItem,
    clearWishlist,
    isInWishlist
  }), [state, addItem, removeItem, clearWishlist, isInWishlist]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  
  return context;
};