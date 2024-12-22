import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Javascript from "./pages/Javascript";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/javascript" element={<Javascript />} />
      </Routes>
    </Router>
  );
};

export default App;
