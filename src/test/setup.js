/**
 * Test Setup
 * Global test configuration and utilities
 */

import '@testing-library/jest-dom';
import { beforeAll, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock environment variables
vi.mock('../../config/index.js', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:5000',
    VERSION: 'v1',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  APP_CONFIG: {
    NAME: 'Olossia',
    VERSION: '1.0.0',
    ENVIRONMENT: 'test',
    IS_PRODUCTION: false,
    IS_DEVELOPMENT: false,
  },
  FEATURE_FLAGS: {
    ENABLE_PWA: false,
    ENABLE_ANALYTICS: false,
    ENABLE_ERROR_REPORTING: false,
    ENABLE_WISHLIST: true,
    ENABLE_COMPARE: true,
  },
}));

// Mock local storage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console methods in tests
beforeAll(() => {
  global.console = {
    ...console,
    // Suppress console.log in tests
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
});
