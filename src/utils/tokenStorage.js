// Token storage utility with security best practices
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getToken = () => {
  try {
    return localStorage.getItem('olossia_token');
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem('olossia_token', token);
  } catch (error) {
    console.error('Error setting token:', error);
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const tokenStorage = {
  // Get access token
  getToken: () => {
    try {
      return localStorage.getItem('olossia_token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Set access token
  setToken: (token) => {
    try {
      localStorage.setItem('olossia_token', token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  },

  // Remove access token
  removeToken: () => {
    try {
      localStorage.removeItem('olossia_token');
    } catch (error) {
      console.error('Error removing token:', error);
    }
  },

  // Get refresh token
  getRefreshToken: () => {
    try {
      return localStorage.getItem('olossia_refresh_token');
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  // Set refresh token
  setRefreshToken: (token) => {
    try {
      localStorage.setItem('olossia_refresh_token', token);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  },

  // Remove refresh token
  removeRefreshToken: () => {
    try {
      localStorage.removeItem('olossia_refresh_token');
    } catch (error) {
      console.error('Error removing refresh token:', error);
    }
  },

  // Clear all tokens
  clearAll: () => {
    try {
      localStorage.removeItem('olossia_token');
      localStorage.removeItem('olossia_refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  // Clear all tokens (alias for consistency)
  clearTokens: () => {
    try {
      localStorage.removeItem('olossia_token');
      localStorage.removeItem('olossia_refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }
};