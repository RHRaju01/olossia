import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tokenStorage } from "../utils/tokenStorage";
import { setUser, clearUser } from "../store/authSlice";
import {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useGetProfileQuery,
} from "../services/api/rtkAuthApi";

export function useAuthRedux() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);

  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const [refreshMutation] = useRefreshMutation();

  const login = useCallback(
    async (credentials) => {
      try {
        const resp = await loginMutation(credentials).unwrap();
        if (resp.success) {
          tokenStorage.setToken(resp.data.token);
          tokenStorage.setRefreshToken(resp.data.refreshToken);
          dispatch(setUser(resp.data.user));
          return { success: true };
        }
        return { success: false, error: resp.message };
      } catch (err) {
        return { success: false, error: err?.data?.message || err.message };
      }
    },
    [loginMutation, dispatch]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const resp = await registerMutation(userData).unwrap();
        if (resp.success) {
          tokenStorage.setToken(resp.data.token);
          tokenStorage.setRefreshToken(resp.data.refreshToken);
          dispatch(setUser(resp.data.user));
          return { success: true };
        }
        return { success: false, error: resp.message };
      } catch (err) {
        return { success: false, error: err?.data?.message || err.message };
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
    }
  }, [dispatch]);

  const refresh = useCallback(async () => {
    try {
      const refreshToken = tokenStorage.getRefreshToken();
      const resp = await refreshMutation({ refreshToken }).unwrap();
      if (resp.success) {
        tokenStorage.setToken(resp.data.token);
        tokenStorage.setRefreshToken(resp.data.refreshToken);
        dispatch(setUser(resp.data.user));
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

  const profile = useGetProfileQuery(null, { skip: !tokenStorage.getToken() });

  return {
    ...auth,
    login,
    register,
    logout,
    refresh,
    profile,
  };
}
