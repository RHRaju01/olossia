import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tokenStorage } from "../../../utils/tokenStorage";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
    prepareHeaders: (headers, { getState }) => {
      // Prefer attaching token from tokenStorage (persists across reloads).
      // Fall back to redux state if you prefer keeping token there.
      try {
        const token = tokenStorage.getToken();
        if (token) {
          headers.set("authorization", `Bearer ${token}`);
        }
      } catch (e) {
        // fallback to redux state (if token stored there)
        const tokenFromState = getState?.()?.auth?.token;
        if (tokenFromState)
          headers.set("authorization", `Bearer ${tokenFromState}`);
      }
      return headers;
    },
  }),
  endpoints: () => ({}),
});
