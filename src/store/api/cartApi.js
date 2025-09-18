import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Cart API using RTK Query
 *
 * This provides optimized data fetching for cart operations
 * with automatic caching, background updates, and loading states.
 */
export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/cart/",
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if available
      const token = localStorage.getItem("auth_token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // Get user's cart
    getCart: builder.query({
      query: () => "",
      providesTags: ["Cart"],
    }),

    // Add item to cart
    addToCart: builder.mutation({
      query: (item) => ({
        url: "add",
        method: "POST",
        body: item,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Update cart item
    updateCartItem: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `update/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Cart"],
    }),

    // Remove item from cart
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `remove/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // Clear entire cart
    clearCart: builder.mutation({
      query: () => ({
        url: "clear",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi;
