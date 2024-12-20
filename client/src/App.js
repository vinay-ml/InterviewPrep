import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import JavaScriptTheoryPage from "./pages/JavaScriptTheoryPage";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1>Welcome to InterviewPrep</h1>} />
        <Route path="/javascript-theory" element={<JavaScriptTheoryPage />} />
      </Routes>
    </Router>
  );
};

export default App;
