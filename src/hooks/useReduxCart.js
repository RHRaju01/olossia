import { useCallback, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectCartItems,
  selectCartLoading,
  selectCartError,
  selectCartTotals,
  selectIsInCart,
  addItem as addItemAction,
  updateItem as updateItemAction,
  removeItem as removeItemAction,
  clearCart as clearCartAction,
  setError,
} from "../store/slices/cartSlice";
import { useAuth } from "../contexts/AuthContext";

export const useReduxCart = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const items = useSelector(selectCartItems);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);
  const totals = useSelector(selectCartTotals);
  const isInCartSelector = useSelector(selectIsInCart);

  useEffect(() => {
    if (!isAuthenticated && items.length > 0) {
      dispatch(clearCartAction());
    }
  }, [isAuthenticated, items.length, dispatch]);

  const addItem = useCallback(
    async (product, quantity = 1, size = "M", color = "Default") => {
      try {
        const cartItem = {
          id: Date.now(),
          product_id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity,
          size,
          color,
          image: product.image,
          variant_id: undefined,
        };

        dispatch(addItemAction(cartItem));
        return { success: true };
      } catch (error) {
        const message = "Failed to add item to cart";
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      try {
        dispatch(updateItemAction({ id: itemId, quantity }));
        return { success: true };
      } catch (error) {
        const message = "Failed to update item";
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const removeItem = useCallback(
    async (itemId) => {
      try {
        dispatch(removeItemAction(itemId));
        return { success: true };
      } catch (error) {
        const message = "Failed to remove item";
        dispatch(setError(message));
        return { success: false, error: message };
      }
    },
    [dispatch]
  );

  const clearCart = useCallback(async () => {
    try {
      dispatch(clearCartAction());
      return { success: true };
    } catch (error) {
      const message = "Failed to clear cart";
      dispatch(setError(message));
      return { success: false, error: message };
    }
  }, [dispatch]);

  const isInCart = useCallback(
    (productId) => {
      return isInCartSelector(productId);
    },
    [isInCartSelector]
  );

  return useMemo(
    () => ({
      items,
      loading,
      error,
      totals,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      isInCart,
    }),
    [
      items,
      loading,
      error,
      totals,
      addItem,
      updateItem,
      removeItem,
      clearCart,
      isInCart,
    ]
  );
};
