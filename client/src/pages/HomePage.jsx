import React from "react";
import "./HomePage.css";
import learning_man from "./learning_man.png";

const HomePage = () => {
  return (
    <div className="home-container">
      <img
        src={learning_man}
        alt="Interview Preparation"
        className="centered-image"
      />
    </div>
  );
};

export default HomePage;
