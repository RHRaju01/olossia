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
