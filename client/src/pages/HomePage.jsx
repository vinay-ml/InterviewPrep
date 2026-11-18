import React from 'react';
import './HomePage.css';
import learning_man from './learning_man.png';

const HomePage = () => {
  return (
    <div className="home-page-wrapper">
      <div className="home-glass-card">
        <div className="hero-image-wrapper">
          <img src={learning_man} alt="Interview Preparation" className="hero-image" />
        </div>
        <div className="hero-cta-wrapper">
          <button
            className="cta-button"
            onClick={() => {
              const menuBtn =
                document.querySelector('[data-topic-drawer-button="true"]') ||
                document.querySelector('button[aria-label="open topic drawer"]');
              if (menuBtn) {
                menuBtn.click();
              }
            }}
          >
            Explore Topics
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
