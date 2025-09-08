import { apiClient } from './client';
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '../../utils/tokenStorage';

export const authAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async signin(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async refreshToken() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh', {
      refreshToken
    });

    if (response.data.success) {
      setToken(response.data.data.token);
      setRefreshToken(response.data.data.refreshToken);
    }

    return response.data;
  },

  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async signout() {
    removeToken();
    removeRefreshToken();
    // For now, just clear local storage
    // In a real app, you might want to call a logout endpoint
    return Promise.resolve({ success: true });
  }
};