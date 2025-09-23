import { useCallback, useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tokenStorage } from "../utils/tokenStorage";
import { setUser, clearUser } from "../store/authSlice";
import {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useGetProfileQuery,
  rtkAuthApi,
} from "../services/api/rtkAuthApi";

export function useAuthRedux() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  // Debugging removed in favor of quieter runtime; keep logic intact.

  // Track when we last manually dispatched setUser from login/register/refresh
  // so a stale in-flight profile response cannot overwrite a freshly-set user.
  const lastManualSetAt = useRef(0);
  const manualUserLock = useRef(false);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [refreshMutation] = useRefreshMutation();
  // Profile query should be declared before callbacks so we can trigger refetch
  // immediately after we set tokens on login/register. This prevents an in-
  // flight or cached profile response (from an old token) from overwriting the
  // freshly-authenticated user.
  const profile = useGetProfileQuery(null, { skip: !tokenStorage.getToken() });

  const [error, setError] = useState(null);
  const [errors, setErrors] = useState(null);

  const login = useCallback(
    async (credentials) => {
      setError(null);
      setErrors(null);
      try {
        const resp = await loginMutation(credentials).unwrap();
        if (resp.success) {
          tokenStorage.setToken(resp.data.token);
          tokenStorage.setRefreshToken(resp.data.refreshToken);
          // dispatching setUser (login)
          // Lock manual user state before dispatching to prevent in-flight
          // profile responses from overwriting this freshly-set user.
          lastManualSetAt.current = Date.now();
          manualUserLock.current = true;
          dispatch(setUser(resp.data.user));
          // Clear lock after 5s to allow profile to re-sync later
          setTimeout(() => {
            manualUserLock.current = false;
          }, 5000);
          // Ensure profile query reflects the newly stored token/user. If a
          // previous profile request resolves later it may overwrite the
          // correct user; force a refetch to replace any stale data.
          try {
            dispatch(
              rtkAuthApi.endpoints.getProfile.initiate(null, {
                forceRefetch: true,
              })
            );
          } catch (e) {
            // ignore
          }
          // Login completed; tokens stored and user dispatched.
          setError(null);
          setErrors(null);
          return { success: true };
        }
        setError(resp.message || null);
        setErrors(resp.errors || null);
        return {
          success: false,
          error: resp.message,
          errors: resp.errors || null,
          data: resp.data || null,
        };
      } catch (err) {
        const message = err?.data?.message || err.message;
        const e = err?.data?.errors || null;
        setError(message || null);
        setErrors(e);
        return { success: false, error: message, errors: e };
      }
    },
    [loginMutation, dispatch]
  );

  const register = useCallback(
    async (userData) => {
      setError(null);
      setErrors(null);
      try {
        const resp = await registerMutation(userData).unwrap();
        if (resp.success) {
          tokenStorage.setToken(resp.data.token);
          tokenStorage.setRefreshToken(resp.data.refreshToken);
          // dispatching setUser (register)
          lastManualSetAt.current = Date.now();
          manualUserLock.current = true;
          dispatch(setUser(resp.data.user));
          setTimeout(() => {
            manualUserLock.current = false;
          }, 5000);
          try {
            dispatch(
              rtkAuthApi.endpoints.getProfile.initiate(null, {
                forceRefetch: true,
              })
            );
          } catch (e) {
            // ignore
          }
          setError(null);
          setErrors(null);
          return { success: true };
        }
        setError(resp.message || null);
        setErrors(resp.errors || null);
        return {
          success: false,
          error: resp.message,
          errors: resp.errors || null,
          data: resp.data || null,
        };
      } catch (err) {
        const message = err?.data?.message || err.message;
        const e = err?.data?.errors || null;
        setError(message || null);
        setErrors(e);
        return { success: false, error: message, errors: e };
      }
    },
    [registerMutation, dispatch]
  );

  const logout = useCallback(async () => {
    try {
      // best-effort server logout
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // ignore
    } finally {
      tokenStorage.clearAll();
      dispatch(clearUser());
      try {
        // Clear RTK Query cached data (profile, etc.) so the previous user's
        // information cannot momentarily re-appear during a new signin.
        dispatch(rtkAuthApi.util.resetApiState());
      } catch (e) {
        // ignore
      }
    }
  }, [dispatch]);

  const refresh = useCallback(async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      const resp = await refreshMutation({ refreshToken }).unwrap();
      if (resp.success) {
        tokenStorage.setToken(resp.data.token);
        tokenStorage.setRefreshToken(resp.data.refreshToken);
        // dispatching setUser (refresh)
        lastManualSetAt.current = Date.now();
        manualUserLock.current = true;
        dispatch(setUser(resp.data.user));
        setTimeout(() => {
          manualUserLock.current = false;
        }, 5000);
        try {
          dispatch(
            rtkAuthApi.endpoints.getProfile.initiate(null, {
              forceRefetch: true,
            })
          );
        } catch (e) {
          // ignore
        }
        return { success: true };
      }
      tokenStorage.clearAll();
      dispatch(clearUser());
      return { success: false };
    } catch (e) {
      tokenStorage.clearAll();
      dispatch(clearUser());
      return { success: false };
    }
  }, [refreshMutation, dispatch]);

  // const profile = useGetProfileQuery(null, { skip: !tokenStorage.getToken() });

  // Initialize auth state from profile query when token exists (persist across reloads)
  // Use an effect so we synchronously react to RTK Query status updates and avoid
  // microtask races that left tokens in storage while Redux auth was stale.
  useEffect(() => {
    if (!profile) return;
    if (profile.isSuccess && profile.data && profile.data.success) {
      const u = profile.data.data.user;
      // If we recently manually set the user because of a login/register/refresh,
      // avoid overwriting it with a potentially stale profile response.
      if (!manualUserLock.current) {
        dispatch(setUser(u));
      }
    } else if (profile.isError) {
      // Invalid or expired token -> clear tokens and auth immediately
      tokenStorage.clearAll();
      dispatch(clearUser());
    }
    // We intentionally depend on the profile status and data
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.isSuccess, profile?.isError, profile?.data]);

  return {
    ...auth,
    error,
    errors,
    clearError: () => {
      setError(null);
      setErrors(null);
    },
    login,
    register,
    logout,
    refresh,
    profile,
    // indicates a short transient window where manual setUser is preferred
    // over a potentially stale profile response
    isAuthLocked: () => !!manualUserLock.current,
  };
}
