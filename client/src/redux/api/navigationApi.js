import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const getStoredToken = () => {
  const tokenData = localStorage.getItem('token');

  if (!tokenData) return null;

  try {
    const { token, expiry } = JSON.parse(tokenData);
    const isExpired = new Date().getTime() > expiry;

    if (isExpired) {
      localStorage.removeItem('token');
      return null;
    }

    return token;
  } catch (error) {
    return tokenData;
  }
};

export const navigationApi = createApi({
  reducerPath: 'navigationApi',
  baseQuery: fetchBaseQuery({
    baseUrl:
      window.location.hostname === 'job-interview-prep.vercel.app'
        ? 'https://job-interview-prep.vercel.app/api/navigation'
        : `http://${window.location.hostname}:4000/api/navigation`,
    prepareHeaders: (headers) => {
      const token = getStoredToken();

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Navigation'],
  endpoints: (builder) => ({
    getNavigationConfig: builder.query({
      query: () => '/',
      providesTags: ['Navigation'],
    }),
    addNavigationSection: builder.mutation({
      query: (body) => ({
        url: '/sections',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Navigation'],
    }),
    updateNavigationSection: builder.mutation({
      query: ({ sectionId, ...body }) => ({
        url: `/sections/${sectionId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Navigation'],
    }),
    addNavigationTopic: builder.mutation({
      query: ({ sectionId, ...body }) => ({
        url: `/sections/${sectionId}/topics`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Navigation'],
    }),
    updateNavigationTopic: builder.mutation({
      query: ({ sectionId, topicId, ...body }) => ({
        url: `/sections/${sectionId}/topics/${topicId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Navigation'],
    }),
    deleteNavigationSection: builder.mutation({
      query: (sectionId) => ({
        url: `/sections/${sectionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Navigation'],
    }),
    deleteNavigationTopic: builder.mutation({
      query: ({ sectionId, topicId }) => ({
        url: `/sections/${sectionId}/topics/${topicId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Navigation'],
    }),
  }),
});

export const {
  useGetNavigationConfigQuery,
  useAddNavigationSectionMutation,
  useUpdateNavigationSectionMutation,
  useAddNavigationTopicMutation,
  useUpdateNavigationTopicMutation,
  useDeleteNavigationSectionMutation,
  useDeleteNavigationTopicMutation,
} = navigationApi;
