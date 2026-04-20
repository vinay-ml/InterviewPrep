import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryQuestions from './pages/CategoryQuestions';
import HomePage from './pages/HomePage';

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const navEntry = window.performance.getEntriesByType('navigation')[0];
    const isHardReload = navEntry?.type === 'reload';

    if (isHardReload && location.pathname !== '/') {
      navigate('/');
    }
  }, [location.pathname, navigate]);

  return (
    <>
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
    </>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
