import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "../services/api/baseApi";
import authReducer, { setUser } from "./authSlice";
import cartReducer, { clearLocalItems } from "./cartSlice";
import { tokenStorage } from "../utils/tokenStorage";

const listenerMiddleware = createListenerMiddleware();

// Listen for auth setUser - when a user logs in (payload truthy), trigger cart merge
listenerMiddleware.startListening({
  actionCreator: setUser,
  effect: async (action, listenerApi) => {
    try {
      const user = action.payload;
      if (!user) return; // ignore logout

      // Read current guest local items from state. If the new CartContext is being used
      // and Redux slice is empty, fall back to any persisted guest_cart in localStorage
      const state = listenerApi.getState();
      let localItems = state.cart?.localItems || [];
      try {
        if ((!localItems || localItems.length === 0) && typeof window !== "undefined") {
          const persisted = window.localStorage.getItem("guest_cart");
          if (persisted) {
            const parsed = JSON.parse(persisted);
            if (Array.isArray(parsed) && parsed.length > 0) {
              localItems = parsed;
            }
          }
        }
      } catch (e) {
        // ignore parsing errors
      }
      if (!localItems || localItems.length === 0) return;

      // Convert to server payload: { items: [{ product_id, variant_id, quantity }] }
      const payloadItems = localItems.map((li) => ({
        product_id: li.product_id,
        variant_id: li.variant_id || null,
        quantity: li.quantity,
      }));

      // Debug: log token availability and items before initiating merge
      // Optional debug info removed in production; token availability can be inspected via debug tools when needed.

      // Wait briefly for tokens to be persisted to localStorage by auth flow
      // Sometimes setUser is dispatched before tokenStorage has the token available
      // Poll tokenStorage for up to ~500ms before attempting the merge so the
      // outgoing request includes Authorization header.
      let token = tokenStorage.getToken();
      let tries = 0;
      const maxTries = 5; // 5 * 100ms = 500ms
      while (!token && tries < maxTries) {
        // small delay
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 100));
        token = tokenStorage.getToken();
        tries += 1;
      }

      if (!token) {
        // Can't attach Authorization header — skip merge to avoid 401 spam.
        return;
      }

      // Initiate the RTK Query mutation via baseApi endpoint (fire-and-forget handled below)
      const mergePromise = listenerApi.dispatch(
        baseApi.endpoints.mergeCart.initiate({ items: payloadItems })
      );

      // Wait for merge to finish
      const result = await mergePromise.unwrap().catch((e) => {
        // swallow - fallback logic could be implemented here if needed
        console.warn("mergeCart failed in listener", e);
        return null;
      });

      if (result) {
        // Clear guest cart on successful merge
        listenerApi.dispatch(clearLocalItems());
      }
    } catch (err) {
      console.error("Error in auth->cart merge listener:", err);
    }
  },
});

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Increase immutable/serializable check thresholds to avoid false-positive warnings in dev
      immutableCheck: { warnAfter: 256 },
      serializableCheck: { warnAfter: 256 },
    })
      .concat(baseApi.middleware)
      .prepend(listenerMiddleware.middleware),
});

// Persist cart.localItems to localStorage
let lastCartJson = null;
store.subscribe(() => {
  try {
    const state = store.getState();
    const toPersist = state.cart?.localItems || [];
    const cartJson = JSON.stringify(toPersist);
    if (cartJson !== lastCartJson) {
      lastCartJson = cartJson;
      if (typeof window !== "undefined") {
        window.localStorage.setItem("guest_cart", cartJson);
      }
    }
  } catch (e) {
    // ignore
  }
});

setupListeners(store.dispatch);
