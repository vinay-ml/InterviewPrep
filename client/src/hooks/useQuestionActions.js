import {
  useDeleteQuestionMutation,
  useDeleteImageMutation,
} from "../redux/api/javascriptTheoryQuestionsApi";

const useQuestionActions = () => {
  const [deleteQuestion] = useDeleteQuestionMutation();
  const [deleteImage] = useDeleteImageMutation();

  // Function to delete a question
  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(id).unwrap();
        alert("Question deleted successfully");
      } catch (error) {
        console.error("Error deleting question:", error.message);
        alert("Failed to delete question");
      }
    }
  };

  // Function to delete an image
  const handleDeleteImage = async ({ id, imageUrl }) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteImage({ id, imageUrl }).unwrap();
        alert("Image deleted successfully");
      } catch (error) {
        console.error("Error deleting image:", error.message);
        alert("Failed to delete image");
      }
    }
  };

  return { handleDeleteQuestion, handleDeleteImage };
};

export default useQuestionActions;
