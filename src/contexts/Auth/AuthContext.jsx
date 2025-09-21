// ...existing code copied from src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authAPI } from "../../services/api/authAPI";
import {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
} from "../../services/api/rtkAuthApi";
import { tokenStorage } from "../../utils/tokenStorage";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../../store/authSlice";

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "AUTH_SUCCESS":
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
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
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const reduxDispatch = useDispatch();

  // Use RTK Query to fetch profile when a token exists
  const token = tokenStorage.getToken();

  // If no token, immediately set unauthenticated
  useEffect(() => {
    if (!token) {
      dispatch({ type: "AUTH_FAILURE", payload: null });
    }
  }, [token]);

  const {
    data: profileResponse,
    isSuccess: profileSuccess,
    isError: profileError,
  } = useGetProfileQuery(null, { skip: !token });

  // Respond to RTK Query profile result
  useEffect(() => {
    if (!token) return;

    if (profileSuccess) {
      const response = profileResponse;
      if (response?.success) {
        const user = response.data.user;
        dispatch({ type: "AUTH_SUCCESS", payload: { user } });
        reduxDispatch(setUser(user));
      } else {
        tokenStorage.clearAll();
        dispatch({ type: "AUTH_FAILURE", payload: null });
      }
    } else if (profileError) {
      tokenStorage.clearAll();
      dispatch({ type: "AUTH_FAILURE", payload: null });
    }
  }, [profileResponse, profileSuccess, profileError, token]);

  // RTK Query mutations
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();

  // Login function
  const login = useCallback(
    async (credentials) => {
      dispatch({ type: "AUTH_START" });
      try {
        const response = await loginMutation(credentials).unwrap();

        if (response.success) {
          // Store tokens
          tokenStorage.setToken(response.data.token);
          tokenStorage.setRefreshToken(response.data.refreshToken);

          const user = response.data.user;
          dispatch({ type: "AUTH_SUCCESS", payload: { user } });
          reduxDispatch(setUser(user));

          return { success: true };
        }

        dispatch({ type: "AUTH_FAILURE", payload: response.message });
        return { success: false, error: response.message };
      } catch (error) {
        const message = error?.data?.message || error.message || "Login failed";
        dispatch({ type: "AUTH_FAILURE", payload: message });
        return { success: false, error: message };
      }
    },
    [loginMutation]
  );

  // Register function
  const register = useCallback(
    async (userData) => {
      dispatch({ type: "AUTH_START" });
      try {
        const response = await registerMutation(userData).unwrap();

        if (response.success) {
          tokenStorage.setToken(response.data.token);
          tokenStorage.setRefreshToken(response.data.refreshToken);

          const user = response.data.user;
          dispatch({ type: "AUTH_SUCCESS", payload: { user } });
          reduxDispatch(setUser(user));

          return { success: true };
        }

        dispatch({ type: "AUTH_FAILURE", payload: response.message });
        return { success: false, error: response.message };
      } catch (error) {
        const message =
          error?.data?.message || error.message || "Registration failed";
        dispatch({ type: "AUTH_FAILURE", payload: message });
        return { success: false, error: message };
      }
    },
    [registerMutation]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenStorage.clearAll();
      dispatch({ type: "LOGOUT" });
      reduxDispatch(clearUser());
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  // Check if user has specific role
  const hasRole = useCallback(
    (role) => {
      return state.user?.role === role;
    },
    [state.user?.role]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles) => {
      return roles.includes(state.user?.role);
    },
    [state.user?.role]
  );

  const value = useMemo(
    () => ({
      ...state,
      login,
      register,
      logout,
      clearError,
      hasRole,
      hasAnyRole,
    }),
    [state, login, register, logout, clearError, hasRole, hasAnyRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
