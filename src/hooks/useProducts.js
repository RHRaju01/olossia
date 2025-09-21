import { useMemo } from "react";
import {
  useGetProductsQuery,
  useGetProductQuery,
  useGetFeaturedProductsQuery,
} from "../services/api";

export const useProducts = (filters = {}) => {
  // RTK Query hook — it handles loading, error, and caching
  const { data, isLoading, isError, refetch } = useGetProductsQuery(filters, {
    skip: false,
  });

  const products = data?.data?.products || [];
  const pagination = data?.data?.pagination || {
    page: 1,
    limit: 20,
    hasMore: false,
  };
  const error = isError ? data?.message || "Failed to fetch products" : null;

  return useMemo(
    () => ({
      products,
      loading: isLoading,
      error,
      pagination,
      refetch,
    }),
    [products, isLoading, error, pagination, refetch]
  );
};

export const useFeaturedProducts = (limit = 6) => {
  const { data, isLoading, isError } = useGetFeaturedProductsQuery(limit);

  const products = data?.data?.products || [];
  const error = isError
    ? data?.message || "Failed to fetch featured products"
    : null;

  return useMemo(
    () => ({ products, loading: isLoading, error }),
    [products, isLoading, error]
  );
};

export const useProduct = (id) => {
  const { data, isLoading, isError } = useGetProductQuery(id, { skip: !id });

  const product = data?.data?.product || null;
  const error = isError ? data?.message || "Failed to fetch product" : null;

  return useMemo(
    () => ({ product, loading: isLoading, error }),
    [product, isLoading, error]
  );
};
