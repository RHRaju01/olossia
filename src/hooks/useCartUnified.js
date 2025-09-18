import { isFeatureEnabled } from "../config/featureFlags";
import { useCart as useContextCart } from "../contexts/CartContext";
import { useReduxCart } from "./useReduxCart";

/**
 * Unified Cart Hook
 *
 * This hook provides the EXACT same interface as the original useCart hook
 * but switches between Context API and Redux implementations based on feature flags.
 *
 * This ensures ZERO changes needed in UI components - they continue working
 * exactly as before while we can test both implementations safely.
 */
export const useCartUnified = () => {
  const useReduxImplementation = isFeatureEnabled("USE_REDUX_CART");

  if (useReduxImplementation) {
    const reduxCart = useReduxCart();
    console.log("🔍 useCartUnified returning Redux cart:", {
      itemsLength: reduxCart.items?.length || 0,
      items: reduxCart.items,
      totals: reduxCart.totals
    });
    return reduxCart;
  }

  const contextCart = useContextCart();
  console.log("🔍 useCartUnified returning Context cart:", {
    itemsLength: contextCart.items?.length || 0,
    items: contextCart.items,
    totals: contextCart.totals
  });
  return contextCart;
};
/**
 * Alias for backward compatibility
 * Components can continue using useCart() without any changes
 */
export const useCart = useCartUnified;
