import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoryQuestions from "./pages/CategoryQuestions";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
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
