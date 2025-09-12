/**
 * Application Constants
 * Centralized constants for better maintainability and consistency
 */

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    DELETE: '/users/delete',
    PREFERENCES: '/users/preferences',
  },
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    CATEGORIES: '/products/categories',
    BRANDS: '/products/brands',
    TRENDING: '/products/trending',
    FEATURED: '/products/featured',
    REVIEWS: '/products/reviews',
  },
  CART: {
    BASE: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
    COUNT: '/cart/count',
  },
  WISHLIST: {
    BASE: '/wishlist',
    ADD: '/wishlist/add',
    REMOVE: '/wishlist/remove',
    CLEAR: '/wishlist/clear',
    TOGGLE: '/wishlist/toggle',
  },
  ORDERS: {
    BASE: '/orders',
    CREATE: '/orders/create',
    HISTORY: '/orders/history',
    DETAILS: '/orders/details',
    CANCEL: '/orders/cancel',
    TRACK: '/orders/track',
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  CUSTOMER: 'customer',
  MODERATOR: 'moderator',
};

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Product Categories
export const PRODUCT_CATEGORIES = {
  WOMEN: 'women',
  MEN: 'men',
  KIDS: 'kids',
  BEAUTY: 'beauty',
  SHOES: 'shoes',
  BAGS: 'bags',
  JEWELRY: 'jewelry',
  HOME: 'home',
  SPORTS: 'sports',
  ELECTRONICS: 'electronics',
};

// Product Sizes
export const PRODUCT_SIZES = {
  CLOTHING: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  SHOES: ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  RINGS: ['5', '6', '7', '8', '9', '10', '11', '12'],
};

// Sort Options
export const SORT_OPTIONS = {
  POPULARITY: 'popularity',
  PRICE_LOW_TO_HIGH: 'price_asc',
  PRICE_HIGH_TO_LOW: 'price_desc',
  NEWEST: 'newest',
  RATING: 'rating',
  NAME_A_TO_Z: 'name_asc',
  NAME_Z_TO_A: 'name_desc',
};

// Filter Options
export const FILTER_OPTIONS = {
  PRICE_RANGES: [
    { min: 0, max: 25, label: 'Under $25' },
    { min: 25, max: 50, label: '$25 - $50' },
    { min: 50, max: 100, label: '$50 - $100' },
    { min: 100, max: 200, label: '$100 - $200' },
    { min: 200, max: null, label: 'Over $200' },
  ],
  RATINGS: [5, 4, 3, 2, 1],
  AVAILABILITY: ['in_stock', 'out_of_stock', 'pre_order'],
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'olossia_auth_token',
  REFRESH_TOKEN: 'olossia_refresh_token',
  USER_PREFERENCES: 'olossia_user_preferences',
  CART_ITEMS: 'olossia_cart_items',
  WISHLIST_ITEMS: 'olossia_wishlist_items',
  THEME: 'olossia_theme',
  LANGUAGE: 'olossia_language',
  CURRENCY: 'olossia_currency',
  RECENT_SEARCHES: 'olossia_recent_searches',
  VIEWED_PRODUCTS: 'olossia_viewed_products',
};

// Event Names
export const EVENTS = {
  // Authentication Events
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  USER_REGISTER: 'user_register',
  
  // Product Events
  PRODUCT_VIEW: 'product_view',
  PRODUCT_SEARCH: 'product_search',
  
  // Cart Events
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  UPDATE_CART_QUANTITY: 'update_cart_quantity',
  CLEAR_CART: 'clear_cart',
  
  // Wishlist Events
  ADD_TO_WISHLIST: 'add_to_wishlist',
  REMOVE_FROM_WISHLIST: 'remove_from_wishlist',
  
  // Purchase Events
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  
  // Navigation Events
  PAGE_VIEW: 'page_view',
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  SORT_APPLIED: 'sort_applied',
};

// Error Messages
export const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  TIMEOUT_ERROR: 'Request timeout. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_NOT_FOUND: 'Account not found.',
  ACCOUNT_DISABLED: 'Account has been disabled.',
  EMAIL_ALREADY_EXISTS: 'Email address is already registered.',
  PASSWORD_TOO_WEAK: 'Password is too weak. Please choose a stronger password.',
  TOKEN_EXPIRED: 'Session has expired. Please log in again.',
  
  // Validation Errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  
  // Product Errors
  PRODUCT_NOT_FOUND: 'Product not found.',
  OUT_OF_STOCK: 'This product is currently out of stock.',
  INVALID_QUANTITY: 'Please enter a valid quantity.',
  
  // Cart Errors
  CART_ITEM_NOT_FOUND: 'Item not found in cart.',
  CART_LIMIT_EXCEEDED: 'Cart limit exceeded.',
  
  // Generic Errors
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  REGISTER_SUCCESS: 'Account created successfully!',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent!',
  
  // Product Actions
  ADDED_TO_CART: 'Item added to cart!',
  REMOVED_FROM_CART: 'Item removed from cart!',
  ADDED_TO_WISHLIST: 'Item added to wishlist!',
  REMOVED_FROM_WISHLIST: 'Item removed from wishlist!',
  
  // Profile
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  
  // Orders
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_CANCELLED: 'Order cancelled successfully!',
};

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  CREDIT_CARD: /^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/,
  CVV: /^\d{3,4}$/,
};

// Animation Variants for Framer Motion
export const ANIMATION_VARIANTS = {
  FADE_IN: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  SLIDE_UP: {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  SLIDE_DOWN: {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  SLIDE_LEFT: {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  SLIDE_RIGHT: {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  SCALE: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
  },
  STAGGER_CHILDREN: {
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

export default {
  API_ENDPOINTS,
  HTTP_STATUS,
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRODUCT_CATEGORIES,
  PRODUCT_SIZES,
  SORT_OPTIONS,
  FILTER_OPTIONS,
  STORAGE_KEYS,
  EVENTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX_PATTERNS,
  ANIMATION_VARIANTS,
};
