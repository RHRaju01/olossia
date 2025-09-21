import { baseApi } from "./baseApi";

export const rtkCartApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCart: build.query({
      query: () => ({ url: "/cart" }),
      keepUnusedDataFor: 30,
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
