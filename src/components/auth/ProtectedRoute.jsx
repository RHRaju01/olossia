import React from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AccessDenied from "../../components/common/AccessDenied";
import { useAuthRedux } from "../../hooks/useAuthRedux";
import { tokenStorage } from "../../utils/tokenStorage";

export const ProtectedRoute = ({
  children,
  roles = [],
  redirectTo = "/login",
}) => {
  const { isAuthenticated, user, profile, refresh } = useAuthRedux();
  const loading = profile?.isFetching || false;
  const location = useLocation();
  const navigate = useNavigate();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // If profile query errored (invalid/expired token) or there is no token/auth, redirect.
  const token = tokenStorage.getToken();
  if (profile?.isError) {
    // clear tokens just in case and show login suggestion
    tokenStorage.clearAll();
    return (
      <AccessDenied
        title="Session expired"
        message="Your session has expired. Please login again."
        showLogin
      />
    );
  }

  // Redirect to login if not authenticated and no token exists.
  // If a token exists in storage, allow the profile query a chance to populate auth state
  // (avoids brief redirect races on page load while profile is being fetched).
  if (!isAuthenticated && !token) {
    return (
      <AccessDenied
        title="Access denied"
        message="You must be logged in to view this page."
        showLogin
      />
    );
  }

  // Check role-based access
  if (roles.length > 0) {
    // If user is not yet available but a token exists, wait for profile to load
    // to avoid incorrectly denying access while profile is being fetched.
    if (!user) {
      if (token) {
        return (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-50 z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        );
      }
      // No token and no user -> show login suggestion
      return (
        <AccessDenied
          title="Access denied"
          message="You must be logged in to view this page."
          showLogin
        />
      );
    }

    // If user exists but role is not authorized, show shared AccessDenied component
    if (!roles.includes(user?.role)) {
      return (
        <AccessDenied
          title="Access denied"
          message="You don't have permission to access this area."
        />
      );
    }
  }

  return children;
};
