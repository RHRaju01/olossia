import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { authAPI } from '../services/api/authAPI';
import { tokenStorage } from '../utils/tokenStorage';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenStorage.getToken();
        
        if (token) {
          // Get user profile using the token
          const response = await authAPI.getProfile();
          
          if (response.success) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data.user }
            });
          } else {
            // Token is invalid, clear it
            tokenStorage.clearAll();
            dispatch({
              type: 'AUTH_FAILURE',
              payload: null
            });
          }
        } else {
          dispatch({
            type: 'AUTH_FAILURE',
            payload: null
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        tokenStorage.clearAll();
        dispatch({
          type: 'AUTH_FAILURE',
          payload: 'Session expired'
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success) {
        // Store tokens
        tokenStorage.setToken(response.data.token);
        tokenStorage.setRefreshToken(response.data.refreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user }
        });
        
        return { success: true };
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      });
      return { success: false, error: message };
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Store tokens
        tokenStorage.setToken(response.data.token);
        tokenStorage.setRefreshToken(response.data.refreshToken);
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user }
        });
        
        return { success: true };
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: response.message
        });
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      });
      return { success: false, error: message };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenStorage.clearAll();
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback((role) => {
    return state.user?.role === role;
  }, [state.user?.role]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles) => {
    return roles.includes(state.user?.role);
  }, [state.user?.role]);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    clearError,
    hasRole,
    hasAnyRole
  }), [state, login, register, logout, clearError, hasRole, hasAnyRole]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};