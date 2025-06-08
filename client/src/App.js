import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import CategoryQuestions from "./pages/CategoryQuestions";
import HomePage from "./pages/HomePage";
import OnlineUsers from "./pages/OnlineUsers";
import { jwtDecode } from "jwt-decode";

const App = () => {
  const token = localStorage.getItem("token");
  let username = "Guest";

  if (token) {
    try {
      username = jwtDecode(token)?.username || "Guest";
    } catch (error) {
      console.error("Invalid token");
    }
  }

  return (
    <Router>
      <Navbar />
      <OnlineUsers username={username} /> {/* ✅ Always rendered */}
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
