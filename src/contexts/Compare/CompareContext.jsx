import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuthRedux } from "../../hooks/useAuthRedux";

const matchesProductId = (item, productId) => {
  if (!item) return false;
  const candidateIds = new Set();
  if (item.product_id) candidateIds.add(item.product_id);
  if (item.id) candidateIds.add(item.id);
  if (item.sku) candidateIds.add(item.sku);
  if (item.product) {
    if (item.product.id) candidateIds.add(item.product.id);
    if (item.product.slug) candidateIds.add(item.product.slug);
  }
  return candidateIds.has(productId) || candidateIds.has(String(productId));
};

const CompareContext = createContext();

const compareReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    case "SET_ITEMS":
      return {
        ...state,
        items: action.payload,
        loading: false,
      };
    case "ADD_ITEM":
      // Limit to 4 items for comparison
      if (state.items.length >= 4) {
        return {
          ...state,
          error: "You can compare up to 4 products at a time",
        };
      }

      const existingItem = state.items.find((item) =>
        matchesProductId(item, action.payload.product_id)
      );
      if (existingItem) {
        return {
          ...state,
          error: "Product already in comparison",
        };
      }

      return {
        ...state,
        items: [...state.items, action.payload],
        error: null,
      };
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
      };
    case "CLEAR_COMPARE":
      return {
        ...state,
        items: [],
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
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

export const CompareProvider = ({ children }) => {
  const [state, dispatch] = useReducer(compareReducer, initialState);
  const { isAuthenticated } = useAuthRedux();

  // Load compare items when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Mock compare items for demo (replace with API calls later)
      const mockItems = [];
      dispatch({ type: "SET_ITEMS", payload: mockItems });
    } else {
      dispatch({ type: "CLEAR_COMPARE" });
    }
  }, [isAuthenticated]);

  const addItem = useCallback(
    async (product) => {
      try {
        // Check if item already exists and remove it (toggle functionality)
        const existingItem = state.items.find((item) =>
          matchesProductId(item, product.id)
        );
        if (existingItem) {
          dispatch({ type: "REMOVE_ITEM", payload: existingItem.id });
          return { success: true, action: "removed" };
        }

        const compareItem = {
          id: Date.now(), // Mock ID
          product_id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          rating: product.rating || 4.5,
          reviews: product.reviews || 100,
          image: product.image,
          colors: product.colors || [],
          category: product.category || "fashion",
          description: product.description || "Premium quality fashion piece",
          features: product.features || [
            "Premium materials",
            "Comfortable fit",
            "Easy care",
          ],
          specifications: product.specifications || {
            Material: "Premium fabric",
            Care: "Machine washable",
            Origin: "Made with care",
          },
        };

        dispatch({ type: "ADD_ITEM", payload: compareItem });
        return { success: true, action: "added" };
      } catch (error) {
        const message = "Failed to add item to comparison";
        dispatch({ type: "SET_ERROR", payload: message });
        return { success: false, error: message };
      }
    },
    [state.items]
  );

  const removeItem = useCallback(async (itemId) => {
    try {
      dispatch({ type: "REMOVE_ITEM", payload: itemId });
      return { success: true };
    } catch (error) {
      const message = "Failed to remove item from comparison";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, error: message };
    }
  }, []);

  const clearCompare = useCallback(async () => {
    try {
      dispatch({ type: "CLEAR_COMPARE" });
      return { success: true };
    } catch (error) {
      const message = "Failed to clear comparison";
      dispatch({ type: "SET_ERROR", payload: message });
      return { success: false, error: message };
    }
  }, []);

  const isInCompare = useCallback(
    (productId) => {
      return state.items.some((item) => matchesProductId(item, productId));
    },
    [state.items]
  );

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addItem,
      removeItem,
      clearCompare,
      isInCompare,
      clearError,
    }),
    [state, addItem, removeItem, clearCompare, isInCompare, clearError]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);

  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }

  return context;
};
