import React, { useEffect } from "react";
import { useCart } from "../hooks/useCartUnified";
import {
  testFeatureFlags,
  testCartHookInterface,
} from "../utils/testCartMigration";

/**
 * Cart Migration Test Component
 *
 * This component can be temporarily added to any page to test
 * the cart migration functionality. Remove after testing is complete.
 */
export const CartMigrationTest = () => {
  const cart = useCart();

  useEffect(() => {
    // Run tests on component mount
    const flagTest = testFeatureFlags();
    const interfaceTest = testCartHookInterface(cart);

    console.log("🧪 Test Results:", {
      featureFlags: flagTest,
      interface: interfaceTest,
    });
  }, [cart]);

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "#f0f0f0",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <div>🧪 Cart Migration Test</div>
      <div>Items: {cart.items?.length || 0}</div>
      <div>Loading: {cart.loading ? "Yes" : "No"}</div>
      <div>Implementation: Context API</div>
      <div style={{ fontSize: "10px", marginTop: "5px" }}>
        Check console for details
      </div>
    </div>
  );
};

export default CartMigrationTest;
