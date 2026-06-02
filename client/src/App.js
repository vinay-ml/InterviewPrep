import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryQuestions from './pages/CategoryQuestions';
import HomePage from './pages/HomePage';
import OnlineUsers from './pages/OnlineUsers';
import { jwtDecode } from 'jwt-decode';
import { useGetNavigationConfigQuery } from './redux/api/navigationApi';

const AppRoutes = () => {
  const token = localStorage.getItem('token');
  let username = 'Guest';

  if (token) {
    try {
      username = jwtDecode(token)?.username || 'Guest';
    } catch (error) {
      console.error('Invalid token');
    }
  }

  const navigate = useNavigate();
  const location = useLocation();
  useGetNavigationConfigQuery(undefined, { skip: location.pathname !== '/' });

  useEffect(() => {
    const navEntry = window.performance.getEntriesByType('navigation')[0];
    const isHardReload = navEntry?.type === 'reload';

    if (isHardReload && location.pathname !== '/') {
      navigate('/');
    }
  }, []);

  return (
    <>
      <Navbar />
      <OnlineUsers username={username} />
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
