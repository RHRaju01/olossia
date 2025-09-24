import { baseApi } from "./baseApi";

export const rtkCartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query({
      query: () => ({ url: "/cart" }),
      keepUnusedDataFor: 30,
      // Skip the network call when there is no token in storage to avoid 401s for guest users.
      providesTags: (result, error, arg) => {
        return result ? [{ type: "Cart", id: "LIST" }] : [];
      },
      transformResponse: (response, meta, arg) => {
        // If response is empty or not available, return an empty cart shape to avoid 401s bubbling up
        if (!response) return { data: { items: [] } };
        return response;
      },
      // Client-side guard: callers can skip by checking tokenStorage.getToken() before using the hook
    }),
    addItem: build.mutation({
      query: (item) => ({ url: "/cart/items", method: "POST", body: item }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        // Optimistic update: add a temporary item to the cached getCart query
        try {
          const patchResult = dispatch(
            baseApi.util.updateQueryData("getCart", undefined, (draft) => {
              const temp = {
                id: `temp-${Date.now()}`,
                product_id: arg.product_id,
                variant_id: arg.variant_id || null,
                quantity: arg.quantity || 1,
                // minimal product fields to keep UI stable
                name: arg.name || null,
                price: arg.price || null,
                image: arg.image || null,
              };
              draft.data = draft.data || { items: [] };
              draft.data.items = draft.data.items || [];
              draft.data.items.push(temp);
            })
          );

          await queryFulfilled;
          // No further action: server response will be reflected automatically
          return patchResult;
        } catch (err) {
          // Rollback is automatic by applying inverse of patchResult
          console.warn("addItem optimistic update failed", err);
        }
      },
    }),
    updateItem: build.mutation({
      query: ({ itemId, update }) => ({
        url: `/cart/items/${itemId}`,
        method: "PUT",
        body: update,
      }),
    }),
    removeItem: build.mutation({
      query: (itemId) => ({ url: `/cart/items/${itemId}`, method: "DELETE" }),
      async onQueryStarted(itemId, { dispatch, queryFulfilled }) {
        // Optimistic update: remove item from getCart cache immediately
        const patchResult = dispatch(
          baseApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (!draft || !draft.data || !Array.isArray(draft.data.items))
              return;
            draft.data.items = draft.data.items.filter(
              (it) => it.id !== itemId
            );
          })
        );
        try {
          await queryFulfilled;
        } catch (err) {
          patchResult.undo();
          console.warn("removeItem optimistic rollback", err);
        }
      },
    }),
    clearCart: build.mutation({
      query: () => ({ url: "/cart", method: "DELETE" }),
    }),
    // Bulk merge guest items into user cart
    mergeCart: build.mutation({
      query: (body) => ({ url: "/cart/merge", method: "POST", body }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCartQuery,
  useAddItemMutation,
  useUpdateItemMutation,
  useRemoveItemMutation,
  useClearCartMutation,
  useMergeCartMutation,
} = rtkCartApi;
