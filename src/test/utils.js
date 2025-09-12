/**
 * Test Utilities
 * Shared utilities for testing components and functions
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthContext } from '../contexts/AuthContext.jsx';
import { CartContext } from '../contexts/CartContext.jsx';
import { WishlistContext } from '../contexts/WishlistContext.jsx';

/**
 * Creates a new QueryClient for testing
 */
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0,
    },
  },
});

/**
 * Mock authentication context value
 */
export const createMockAuthContext = (overrides = {}) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
  ...overrides,
});

/**
 * Mock cart context value
 */
export const createMockCartContext = (overrides = {}) => ({
  items: [],
  totalItems: 0,
  totalPrice: 0,
  subtotal: 0,
  shipping: 0,
  total: 0,
  loading: false,
  error: null,
  addItem: jest.fn(),
  updateItem: jest.fn(),
  removeItem: jest.fn(),
  clearCart: jest.fn(),
  ...overrides,
});

/**
 * Mock wishlist context value
 */
export const createMockWishlistContext = (overrides = {}) => ({
  items: [],
  loading: false,
  error: null,
  addItem: jest.fn(),
  removeItem: jest.fn(),
  clearWishlist: jest.fn(),
  isInWishlist: jest.fn(() => false),
  ...overrides,
});

/**
 * Test wrapper component with all providers
 */
export const TestWrapper = ({ 
  children, 
  authValue,
  cartValue,
  wishlistValue,
  queryClient = createTestQueryClient(),
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContext.Provider value={authValue || createMockAuthContext()}>
          <CartContext.Provider value={cartValue || createMockCartContext()}>
            <WishlistContext.Provider value={wishlistValue || createMockWishlistContext()}>
              {children}
            </WishlistContext.Provider>
          </CartContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

/**
 * Custom render function with providers
 */
export const renderWithProviders = (ui, options = {}) => {
  const {
    authValue,
    cartValue,
    wishlistValue,
    queryClient,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <TestWrapper
      authValue={authValue}
      cartValue={cartValue}
      wishlistValue={wishlistValue}
      queryClient={queryClient}
    >
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Mock API response
 */
export const createMockApiResponse = (data, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {},
});

/**
 * Mock API error
 */
export const createMockApiError = (message = 'API Error', status = 500) => {
  const error = new Error(message);
  error.response = {
    data: { message },
    status,
    statusText: 'Internal Server Error',
  };
  return error;
};

/**
 * Mock product data
 */
export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: 'Test Product',
  brand: 'Test Brand',
  price: 99.99,
  image: 'https://example.com/image.jpg',
  category: 'clothing',
  description: 'Test product description',
  inStock: true,
  rating: 4.5,
  reviews: 100,
  colors: ['#000000', '#FFFFFF'],
  sizes: ['S', 'M', 'L'],
  ...overrides,
});

/**
 * Mock user data
 */
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  name: 'Test User',
  role: 'customer',
  avatar: null,
  preferences: {},
  ...overrides,
});

/**
 * Mock cart item
 */
export const createMockCartItem = (overrides = {}) => ({
  id: 1,
  product_id: 1,
  quantity: 1,
  products: createMockProduct(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

/**
 * Wait for element to be removed
 */
export const waitForElementToBeRemoved = async (callback) => {
  const { waitForElementToBeRemoved: originalWait } = await import('@testing-library/react');
  return originalWait(callback);
};

/**
 * Fire event helper
 */
export { fireEvent, screen, waitFor } from '@testing-library/react';

/**
 * User event helper
 */
export { default as userEvent } from '@testing-library/user-event';

export default {
  createTestQueryClient,
  createMockAuthContext,
  createMockCartContext,
  createMockWishlistContext,
  TestWrapper,
  renderWithProviders,
  createMockApiResponse,
  createMockApiError,
  createMockProduct,
  createMockUser,
  createMockCartItem,
};
