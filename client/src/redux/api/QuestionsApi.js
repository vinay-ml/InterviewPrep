import { createApi } from '@reduxjs/toolkit/query/react';
import { createOfflineAwareBaseQuery } from '../../utils/offline';

export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  refetchOnReconnect: true,
  baseQuery: createOfflineAwareBaseQuery({
    cacheGet: true,
    baseUrl:
      window.location.hostname === 'job-interview-prep.vercel.app'
        ? 'https://job-interview-prep.vercel.app/api/questions'
        : `http://${window.location.hostname}:4000/api/questions`,
  }),
  tagTypes: ['Questions'],
  endpoints: (builder) => ({
    // Fetch all questions by category
    getAllQuestions: builder.query({
      query: (category) => `/all/${category}`,
      providesTags: ['Questions'],
    }),

    // Add a new question
    addQuestion: builder.mutation({
      query: (formData) => ({
        url: '/add',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['Questions'],
    }),

    // Update a question
    updateQuestion: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/update/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Questions'],
    }),

    // Delete a specific image from a question
    deleteImage: builder.mutation({
      query: (body) => ({
        url: '/delete-image',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Questions'],
    }),

    // Delete a question and its images
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Questions'],
    }),
  }),
});

export const {
  useGetAllQuestionsQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteImageMutation,
  useDeleteQuestionMutation,
} = questionsApi;
