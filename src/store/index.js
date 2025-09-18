import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// Import cart slice
import cartSlice from "./slices/cartSlice";
// import { cartApi } from "./api/cartApi";

/**
 * Redux Store Configuration
 * Uses Redux Toolkit for simplified setup and better developer experience
 */
export const createStore = () => {
  const store = configureStore({
    reducer: {
      // State slices
      cart: cartSlice,
      // RTK Query APIs will be added later
      // [cartApi.reducerPath]: cartApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types for RTK Query
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        },
      }), // RTK Query middleware will be added later
    // .concat(cartApi.middleware),
    devTools: import.meta.env.DEV, // Fixed for Vite
  });

  // Enable refetchOnFocus/refetchOnReconnect behaviors for RTK Query
  setupListeners(store.dispatch);

  return store;
};

// Create the store instance
export const store = createStore();
