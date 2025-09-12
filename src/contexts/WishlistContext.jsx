import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import wishlistAPI from '../services/api/wishlistAPI';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

const wishlistReducer = (state, action) => {
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
      const existingItem = state.items.find(item => item.product_id === action.payload.product_id);
      if (existingItem) {
        return state; // Item already in wishlist
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== action.payload),
      };
    case 'CLEAR_WISHLIST':
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

export const WishlistProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wishlistReducer, initialState);
  const { isAuthenticated } = useAuth();

  // Load wishlist items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlistItems();
    } else {
      dispatch({ type: 'CLEAR_WISHLIST' });
    }
  }, [isAuthenticated]);

  const loadWishlistItems = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await wishlistAPI.getItems();
      if (response.success) {
        dispatch({ type: 'SET_ITEMS', payload: response.data.items });
      }
    } catch (error) {
      console.error('Error loading wishlist items:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const addItem = useCallback(
    async product => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await wishlistAPI.addItem(product.id);
        if (response.success) {
          await loadWishlistItems();
          return { success: true };
        } else {
          return {
            success: false,
            error: response.error || 'Failed to add item to wishlist',
          };
        }
      } catch (error) {
        console.error('Error adding item to wishlist:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        return { success: false, error: error.message };
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [loadWishlistItems]
  );

  const toggleItem = useCallback(
    async product => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await wishlistAPI.toggleItem(product.id);
        if (response.success) {
          await loadWishlistItems();
        }
        return response;
      } catch (error) {
        console.error('Error toggling wishlist item:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [loadWishlistItems]
  );

  const removeItem = useCallback(
    async productId => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await wishlistAPI.removeItem(productId);
        if (response.success) {
          await loadWishlistItems();
        }
      } catch (error) {
        console.error('Error removing wishlist item:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [loadWishlistItems]
  );

  const clearWishlist = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await wishlistAPI.clearWishlist();
      if (response.success) {
        dispatch({ type: 'CLEAR_WISHLIST' });
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Check if item is in wishlist
  const isInWishlist = useCallback(
    productId => {
      return state.items.some(item => item.product_id === productId);
    },
    [state.items]
  );

  // Calculate totals
  const totals = useMemo(
    () => ({
      totalItems: state.items.length,
    }),
    [state.items]
  );

  const value = {
    ...state,
    ...totals,
    addItem,
    toggleItem,
    removeItem,
    clearWishlist,
    clearError,
    isInWishlist,
    loadWishlistItems,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
