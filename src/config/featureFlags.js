/**
 * Feature Flags Configuration
 * Controls the rollout of new features and experimental implementations
 */

export const FEATURE_FLAGS = {
  // Cart Migration: Switch between Context API and Redux implementation
  USE_REDUX_CART: import.meta.env.VITE_USE_REDUX_CART === "true" || false,

  // Future migration flags (for other contexts)
  USE_REDUX_AUTH: import.meta.env.VITE_USE_REDUX_AUTH === "true" || false,
  USE_REDUX_WISHLIST:
    import.meta.env.VITE_USE_REDUX_WISHLIST === "true" || false,
  USE_REDUX_COMPARE: import.meta.env.VITE_USE_REDUX_COMPARE === "true" || false,

  // RTK Query flags
  USE_RTK_QUERY_CART:
    import.meta.env.VITE_USE_RTK_QUERY_CART === "true" || false,
  USE_RTK_QUERY_PRODUCTS:
    import.meta.env.VITE_USE_RTK_QUERY_PRODUCTS === "true" || false,
};

/**
 * Check if a specific feature is enabled
 * @param {string} flag - The feature flag key
 * @returns {boolean} - Whether the feature is enabled
 */
export const isFeatureEnabled = (flag) => {
  return FEATURE_FLAGS[flag] || false;
};

/**
 * Get all enabled features (for debugging)
 * @returns {object} - Object with enabled features only
 */
export const getEnabledFeatures = () => {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => enabled)
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
};

/**
 * Development helper to log feature flag status
 */
export const logFeatureFlags = () => {
  if (import.meta.env.DEV) {
    console.group("🚩 Feature Flags Status");
    Object.entries(FEATURE_FLAGS).forEach(([flag, enabled]) => {
      console.log(`${flag}: ${enabled ? "✅ Enabled" : "❌ Disabled"}`);
    });
    console.groupEnd();
  }
};
