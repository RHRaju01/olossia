import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuthRedux } from "../../hooks/useAuthRedux";

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload, loading: false };
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map((it) =>
          it.id === action.payload.id ? { ...it, ...action.payload.changes } : it
        ),
      };
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((it) => it.id !== action.payload) };
    case "CLEAR_CART":
      return { ...state, items: [] };
    default:
      return state;
  }
};

const initialState = { items: [], loading: false };

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { isAuthenticated } = useAuthRedux();

  // Seed mock cart items for demo when authenticated. Mirrors wishlist behavior.
  // Seed or restore cart items depending on auth state.
  useEffect(() => {
    try {
      if (isAuthenticated) {
        // For authenticated demo mode we seed some mock items.
        const mockItems = [
          {
            id: "local-1",
            product_id: "vintage-denim-jacket",
            name: "Vintage Denim Jacket",
            brand: "LEVI'S",
            price: 159,
            quantity: 1,
            image:
              "https://images.pexels.com/photos/1620760/pexels-photo-1620760.jpeg?auto=compress&cs=tinysrgb&w=200",
          },
          {
            id: "local-2",
            product_id: "casual-sneaker",
            name: "Casual Sneakers",
            brand: "SNEAK CO",
            price: 89,
            quantity: 2,
            image:
              "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=200",
          },
        ];
        dispatch({ type: "SET_ITEMS", payload: mockItems });
      } else {
        // For guests, restore persisted guest cart if present
        const saved = localStorage.getItem("guest_cart");
        if (saved) {
          const parsed = JSON.parse(saved || "[]");
          dispatch({ type: "SET_ITEMS", payload: parsed });
        } else {
          dispatch({ type: "SET_ITEMS", payload: [] });
        }
      }
    } catch (err) {
      console.warn("Cart restore failed", err);
      dispatch({ type: "SET_ITEMS", payload: [] });
    }
  }, [isAuthenticated]);

  const addItem = useCallback((product) => {
    // Normalize and retain additional product metadata so cart items
    // have similar shape to wishlist items (brand, originalPrice, rating, reviews, inStock, colors)
    const normalized = {
      id: product.id || product.product_id || `local-${Date.now()}`,
      product_id: product.id || product.product_id,
      variant_id: product.variant_id || product.variant || null,
      name: product.name || product.title || "",
      brand: product.brand || product.maker || "",
      price: product.price || 0,
      originalPrice: product.originalPrice || product.listPrice || null,
      quantity: product.quantity || 1,
      image: product.image || product.images?.[0] || "",
      size: product.size || null,
      color: product.color || null,
      rating: product.rating || product.reviews?.rating || null,
      reviews: product.reviews || product.reviewsCount || null,
      inStock: typeof product.inStock === "boolean" ? product.inStock : true,
      colors: product.colors || [],
    };

    // If an item with same product_id and variant exists, update quantity instead of adding duplicate
    const existing = state.items.find((it) => {
      if (!it) return false;
      const itProductId = String(it.product_id || it.id || "");
      const newProductId = String(normalized.product_id || normalized.id || "");
      const sameProduct = itProductId === newProductId;
      const itVariant = String(it.variant_id || "");
      const newVariant = String(normalized.variant_id || "");
      const sameVariant = itVariant === newVariant;
      return sameProduct && sameVariant;
    });

    if (existing) {
      // update quantity
      const newQuantity = (existing.quantity || 1) + (normalized.quantity || 1);
      dispatch({ type: "UPDATE_ITEM", payload: { id: existing.id, changes: { quantity: newQuantity } } });
      return { success: true, updated: true };
    }

    // create new cart item with ensured id
    const cartItem = { ...normalized, id: normalized.id || `local-${Date.now()}` };
    dispatch({ type: "ADD_ITEM", payload: cartItem });
    return { success: true, added: true };
  }, [state.items]);

  const isInCart = useCallback(
    (productId) => {
      return state.items.some((it) => {
        if (!it) return false;
        const ids = [it.product_id, it.id, it.sku];
        if (it.product) ids.push(it.product.id, it.product.slug);
        return ids.some((x) => x === productId || String(x) === String(productId));
      });
    },
    [state.items]
  );

  const toggleItem = useCallback((product) => {
    // If exists, remove by id; otherwise add
    const existing = state.items.find((it) => {
      if (!it) return false;
      const ids = [it.product_id, it.id, it.sku];
      if (it.product) ids.push(it.product.id, it.product.slug);
      const productId = product.id || product.product_id;
      return ids.some((x) => String(x) === String(productId));
    });

    if (existing) {
      dispatch({ type: "REMOVE_ITEM", payload: existing.id });
      return { success: true, removed: true };
    }

    const res = addItem(product);
    return res;
  }, [state.items, addItem]);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
    return { success: true };
  }, []);

  const updateItem = useCallback((id, changes) => {
    dispatch({ type: "UPDATE_ITEM", payload: { id, changes } });
    return { success: true };
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    return { success: true };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addItem,
      updateItem,
      removeItem,
      isInCart,
      toggleItem,
      clearCart,
      count: state.items.length,
    }),
    [state, addItem, updateItem, removeItem, isInCart, toggleItem, clearCart]
  );

  // Persist guest cart to localStorage so behaviour mimics wishlist persistence
  useEffect(() => {
    try {
      localStorage.setItem("guest_cart", JSON.stringify(state.items || []));
    } catch (e) {
      /* ignore */
    }
  }, [state.items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
