/**
 * Application Configuration
 * Centralized configuration management for the entire application
 */

// Environment variables validation
const requiredEnvVars = {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Validate required environment variables
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Supabase Configuration
 */
export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL,
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  AUTH: {
    AUTO_REFRESH_TOKEN: true,
    PERSIST_SESSION: true,
    DETECT_SESSION_IN_URL: true,
  },
};

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  NAME: 'Olossia',
  VERSION: __APP_VERSION__ || '1.0.0',
  BUILD_TIME: __BUILD_TIME__ || new Date().toISOString(),
  DESCRIPTION: 'Enterprise Fashion E-commerce Platform',
  ENVIRONMENT: import.meta.env.MODE,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
};

/**
 * UI Configuration
 */
export const UI_CONFIG = {
  THEME: {
    DEFAULT: 'light',
    STORAGE_KEY: 'olossia-theme',
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    PAGE_SIZE_OPTIONS: [12, 24, 48, 96],
  },
  BREAKPOINTS: {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1280,
  },
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
};

/**
 * Feature Flags Configuration
 */
export const FEATURE_FLAGS = {
  ENABLE_PWA: true,
  ENABLE_ANALYTICS: import.meta.env.PROD,
  ENABLE_ERROR_REPORTING: import.meta.env.PROD,
  ENABLE_PERFORMANCE_MONITORING: import.meta.env.PROD,
  ENABLE_WISHLIST: true,
  ENABLE_COMPARE: true,
  ENABLE_REVIEWS: true,
  ENABLE_NOTIFICATIONS: true,
};

/**
 * Cache Configuration
 */
export const CACHE_CONFIG = {
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    MEDIUM: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
  },
  KEYS: {
    USER_PREFERENCES: 'user-preferences',
    CART_ITEMS: 'cart-items',
    WISHLIST_ITEMS: 'wishlist-items',
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
  },
};

/**
 * Security Configuration
 */
export const SECURITY_CONFIG = {
  TOKEN_STORAGE_KEY: 'olossia-auth-token',
  REFRESH_TOKEN_STORAGE_KEY: 'olossia-refresh-token',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  PASSWORD_MIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
};

/**
 * E-commerce Configuration
 */
export const ECOMMERCE_CONFIG = {
  CURRENCY: {
    DEFAULT: 'USD',
    SYMBOL: '$',
    LOCALE: 'en-US',
  },
  SHIPPING: {
    FREE_THRESHOLD: 100,
    DEFAULT_COST: 10,
  },
  TAX: {
    DEFAULT_RATE: 0.08, // 8%
  },
  CART: {
    MAX_QUANTITY: 99,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  },
};

/**
 * SEO Configuration
 */
export const SEO_CONFIG = {
  DEFAULT_TITLE: 'Olossia - Fashion E-commerce Platform',
  TITLE_SEPARATOR: ' | ',
  DEFAULT_DESCRIPTION:
    'Discover the latest fashion trends at Olossia. Shop premium clothing, accessories, and more with fast shipping and excellent customer service.',
  DEFAULT_KEYWORDS: 'fashion, ecommerce, clothing, accessories, online shopping, premium fashion',
  SOCIAL: {
    TWITTER_HANDLE: '@olossia',
    FACEBOOK_APP_ID: '',
    INSTAGRAM_HANDLE: '@olossia',
  },
};

/**
 * Analytics Configuration
 */
export const ANALYTICS_CONFIG = {
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GA_ID,
  FACEBOOK_PIXEL_ID: import.meta.env.VITE_FB_PIXEL_ID,
  ENABLE_DEBUG: import.meta.env.DEV,
  TRACK_PAGE_VIEWS: true,
  TRACK_EVENTS: true,
  TRACK_ECOMMERCE: true,
};

/**
 * Error Tracking Configuration
 */
export const ERROR_CONFIG = {
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  ENABLE_CRASH_REPORTING: import.meta.env.PROD,
  SAMPLE_RATE: 0.1,
  MAX_BREADCRUMBS: 50,
};

export default {
  API_CONFIG,
  SUPABASE_CONFIG,
  APP_CONFIG,
  UI_CONFIG,
  FEATURE_FLAGS,
  CACHE_CONFIG,
  SECURITY_CONFIG,
  ECOMMERCE_CONFIG,
  SEO_CONFIG,
  ANALYTICS_CONFIG,
  ERROR_CONFIG,
};
