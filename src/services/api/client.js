/**
 * Enterprise API Client
 * Enhanced axios client with retry logic, error handling, and monitoring
 */

import axios from 'axios';
import { API_CONFIG } from '../../config/index.js';
import { handleApiError, withRetry } from '../../utils/errorHandling.js';
import {
  getToken,
  removeToken,
  getRefreshToken,
  setToken,
  setRefreshToken,
} from '../../utils/tokenStorage.js';

// Request queue for retry mechanism
const requestQueue = new Map();
let isRefreshing = false;

/**
 * Generate unique request ID for tracking
 */
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create axios instance with enterprise configuration
 */
const baseURL = import.meta.env.DEV
  ? `/api/${API_CONFIG.VERSION}`
  : `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}`;

const apiClient = axios.create({
  baseURL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  decompress: true,
  validateStatus: status => status < 500,
});

/**
 * Add request timing for performance monitoring
 */
apiClient.interceptors.request.use(config => {
  config.metadata = { startTime: new Date() };
  config.headers['X-Request-ID'] = generateRequestId();
  config.headers['X-Client-Version'] = '1.0.0';

  // Add auth token if available
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Response interceptor for error handling and token refresh
 */
apiClient.interceptors.response.use(
  response => {
    // Add timing information
    if (response.config.metadata) {
      response.config.metadata.endTime = new Date();
      response.config.metadata.duration =
        response.config.metadata.endTime - response.config.metadata.startTime;
    }
    return response;
  },
  async error => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshToken = getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(
              `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}/auth/refresh`,
              { refreshToken }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            setToken(accessToken);
            setRefreshToken(newRefreshToken);

            // Process queued requests
            requestQueue.forEach(({ resolve, config }) => {
              config.headers.Authorization = `Bearer ${accessToken}`;
              resolve(apiClient(config));
            });
            requestQueue.clear();

            // Retry original request
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          removeToken();
          requestQueue.clear();

          // Dispatch logout event
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('auth:logout'));
          }

          return Promise.reject(handleApiError(refreshError));
        } finally {
          isRefreshing = false;
        }
      } else {
        // Queue request while refresh is in progress
        return new Promise((resolve, reject) => {
          requestQueue.set(originalRequest, { resolve, reject, config: originalRequest });
        });
      }
    }

    // Handle other errors
    return Promise.reject(handleApiError(error));
  }
);

/**
 * Enhanced request methods with retry logic
 */
export const enhancedApiClient = {
  get: (url, config = {}) => withRetry(() => apiClient.get(url, config)),
  post: (url, data, config = {}) => withRetry(() => apiClient.post(url, data, config)),
  put: (url, data, config = {}) => withRetry(() => apiClient.put(url, data, config)),
  patch: (url, data, config = {}) => withRetry(() => apiClient.patch(url, data, config)),
  delete: (url, config = {}) => withRetry(() => apiClient.delete(url, config)),
};

/**
 * API health check
 */
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return {
      status: 'healthy',
      data: response.data,
      latency: response.config.metadata?.duration || 0,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      latency: error.config?.metadata?.duration || 0,
    };
  }
};

/**
 * Request monitoring utilities
 */
export const monitoring = {
  getActiveRequests: () => requestQueue.size,
  clearQueue: () => requestQueue.clear(),
  isRefreshing: () => isRefreshing,
};

/**
 * Configuration utilities
 */
export const config = {
  updateTimeout: timeout => {
    apiClient.defaults.timeout = timeout;
  },
  updateBaseURL: baseURL => {
    apiClient.defaults.baseURL = baseURL;
  },
  getConfig: () => ({
    baseURL: apiClient.defaults.baseURL,
    timeout: apiClient.defaults.timeout,
  }),
};

/**
 * Request/Response logging for development
 */
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use(request => {
    console.group(`🚀 API Request: ${request.method?.toUpperCase()} ${request.url}`);
    console.log('Headers:', request.headers);
    if (request.data) {
      console.log('Data:', request.data);
    }
    console.groupEnd();
    return request;
  });

  apiClient.interceptors.response.use(
    response => {
      console.group(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`
      );
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.groupEnd();
      return response;
    },
    error => {
      console.group(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.log('Status:', error.response?.status);
      console.log('Message:', error.message);
      if (error.response?.data) {
        console.log('Error Data:', error.response.data);
      }
      console.groupEnd();
      return Promise.reject(error);
    }
  );
}

export default apiClient;
