import { createApi } from '@reduxjs/toolkit/query/react';
import { createOfflineAwareBaseQuery } from '../../utils/offline';

const readStoredSession = () => {
  const storedToken = localStorage.getItem('token');
  if (!storedToken) return null;

  try {
    const parsed = JSON.parse(storedToken);
    if (parsed && typeof parsed === 'object' && parsed.token) return parsed;
  } catch (error) {
    return { token: storedToken };
  }

  return { token: storedToken };
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createOfflineAwareBaseQuery({
    baseUrl:
      window.location.hostname === 'job-interview-prep.vercel.app'
        ? 'https://job-interview-prep.vercel.app/api/auth'
        : `http://${window.location.hostname}:4000/api/auth`,
    prepareHeaders: (headers) => {
      const session = readStoredSession();
      if (!session?.token) return headers;

      if (session.expiry && new Date().getTime() > session.expiry) {
        console.warn('Token expired');
        localStorage.removeItem('token');
        return headers;
      }

      headers.set('Authorization', `Bearer ${session.token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query(body) {
        return {
          url: '/login',
          method: 'POST',
          body,
        };
      },
      async onQueryStarted(args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const now = new Date().getTime();
          const expiry = now + 30 * 24 * 60 * 60 * 1000;
          const tokenData = { token: data.token, expiry };
          localStorage.setItem('token', JSON.stringify(tokenData));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),
  }),
});

export const { useLoginMutation } = authApi;
