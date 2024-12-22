import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Javascript from "./pages/Javascript";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/javascript" replace />} />
        <Route
          path="/javascript"
          element={
            <ProtectedRoute>
              <Javascript />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
