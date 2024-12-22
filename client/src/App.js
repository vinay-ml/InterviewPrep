import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoryQuestions from "./pages/CategoryQuestions";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/javascript" replace />} />
        <Route
          path="/:category"
          element={
            <ProtectedRoute>
              <CategoryQuestions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
