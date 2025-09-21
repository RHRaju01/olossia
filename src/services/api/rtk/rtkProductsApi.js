import { baseApi } from "./baseApi";

export const rtkProductsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query({
      query: (params) => ({ url: "/products", params }),
      keepUnusedDataFor: 60,
    }),
    getProduct: build.query({
      query: (id) => ({ url: `/products/${id}` }),
      keepUnusedDataFor: 60,
    }),
    getFeaturedProducts: build.query({
      query: (limit = 6) => ({ url: "/products/featured", params: { limit } }),
      keepUnusedDataFor: 300,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
} = rtkProductsApi;
