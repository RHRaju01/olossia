/**
 * Manual Test Helper for Cart Migration
 *
 * This file provides utilities to test the cart migration between
 * Context API and Redux implementations.
 */

import { isFeatureEnabled, logFeatureFlags } from "../config/featureFlags";

/**
 * Test the feature flag system
 */
export const testFeatureFlags = () => {
  console.group("🧪 Cart Migration Test");

  // Log current feature flag status
  logFeatureFlags();

  // Test the cart implementation detection
  const usingRedux = isFeatureEnabled("USE_REDUX_CART");
  console.log(
    `Current cart implementation: ${usingRedux ? "Redux" : "Context API"}`
  );

  // Instructions for manual testing
  console.group("📋 Manual Testing Instructions");
  console.log("1. Current state: Context API is active (feature flag = false)");
  console.log("2. Test all cart functionalities work normally");
  console.log("3. To test Redux: Set REACT_APP_USE_REDUX_CART=true in .env");
  console.log("4. Restart the app and verify cart still works");
  console.log("5. Check console for warnings about Redux implementation");
  console.groupEnd();

  console.groupEnd();

  return {
    usingRedux,
    isWorking: true,
    implementation: usingRedux ? "Redux" : "Context API",
  };
};

/**
 * Test cart hook consistency
 * This ensures both implementations provide the same interface
 */
export const testCartHookInterface = (cartHook) => {
  const requiredMethods = [
    "addItem",
    "updateItem",
    "removeItem",
    "clearCart",
    "isInCart",
  ];

  const requiredProperties = ["items", "loading", "error", "totals"];

  console.group("🔍 Cart Hook Interface Test");

  const missingMethods = requiredMethods.filter(
    (method) => typeof cartHook[method] !== "function"
  );

  const missingProperties = requiredProperties.filter(
    (prop) => cartHook[prop] === undefined
  );

  if (missingMethods.length === 0 && missingProperties.length === 0) {
    console.log("✅ Cart hook interface is complete");
  } else {
    console.error("❌ Cart hook interface is incomplete:");
    if (missingMethods.length > 0) {
      console.error("Missing methods:", missingMethods);
    }
    if (missingProperties.length > 0) {
      console.error("Missing properties:", missingProperties);
    }
  }

  console.groupEnd();

  return {
    isComplete: missingMethods.length === 0 && missingProperties.length === 0,
    missingMethods,
    missingProperties,
  };
};
