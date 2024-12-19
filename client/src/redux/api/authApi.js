import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth",
    prepareHeaders: (headers) => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        const { token, expiry } = JSON.parse(storedToken);
        const isExpired = new Date().getTime() > expiry;

        if (isExpired) {
          console.warn("Token expired");
          localStorage.removeItem("token");
        } else {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query(body) {
        return {
          url: "/login",
          method: "POST",
          body,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const now = new Date().getTime();
          const expiry = now + 60 * 24 * 60 * 60 * 1000;
          const tokenData = { token: data.token, expiry };
          localStorage.setItem("token", JSON.stringify(tokenData));
        } catch (error) {
          console.error("Login failed:", error);
        }
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
