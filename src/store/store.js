import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { baseApi } from "../services/api/baseApi";
import authReducer, { setUser } from "./authSlice";
import cartReducer, { clearLocalItems } from "./cartSlice";

const listenerMiddleware = createListenerMiddleware();

// Listen for auth setUser - when a user logs in (payload truthy), trigger cart merge
listenerMiddleware.startListening({
  actionCreator: setUser,
  effect: async (action, listenerApi) => {
    try {
      const user = action.payload;
      if (!user) return; // ignore logout

      // Read current guest local items from state
      const state = listenerApi.getState();
      const localItems = state.cart?.localItems || [];
      if (!localItems || localItems.length === 0) return;

      // Convert to server payload: { items: [{ product_id, variant_id, quantity }] }
      const payloadItems = localItems.map((li) => ({
        product_id: li.product_id,
        variant_id: li.variant_id || null,
        quantity: li.quantity,
      }));

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
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .prepend(listenerMiddleware.middleware),
});

// Persist cart.localItems to localStorage
let lastCartJson = null;
store.subscribe(() => {
  try {
    const state = store.getState();
    const cartJson = JSON.stringify(state.cart?.localItems || []);
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
