import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const javascriptTheoryQuestionsApi = createApi({
  reducerPath: "javascriptTheoryQuestionsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api/javaScriptTheoryQuestions",
  }),
  tagTypes: ["JavaScriptTheoryQuestions"],
  endpoints: (builder) => ({
    // Fetch all JavaScript theory questions
    getAllQuestions: builder.query({
      query: () => "/all",
      providesTags: ["JavaScriptTheoryQuestions"],
    }),

    // Add a new question
    addQuestion: builder.mutation({
      query: (formData) => ({
        url: "/add",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["JavaScriptTheoryQuestions"],
    }),

    // Update a question
    updateQuestion: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/update/${id}`, // Corrected template literal
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["JavaScriptTheoryQuestions"],
    }),

    // Delete a specific image from a question
    deleteImage: builder.mutation({
      query: (body) => ({
        url: "/delete-image",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["JavaScriptTheoryQuestions"],
    }),

    // Delete a question and its images
    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["JavaScriptTheoryQuestions"],
    }),
  }),
});

export const {
  useGetAllQuestionsQuery,
  useAddQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteImageMutation,
  useDeleteQuestionMutation,
} = javascriptTheoryQuestionsApi;
