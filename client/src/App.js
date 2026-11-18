import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CategoryQuestions from './pages/CategoryQuestions';
import HomePage from './pages/HomePage';
import OnlineUsers from './pages/OnlineUsers';
import { jwtDecode } from 'jwt-decode';
import { useGetNavigationConfigQuery } from './redux/api/navigationApi';
import { readStoredJwt } from './utils/offline';
import ThreeDBackground from './components/ThreeDBackground';
import OfflineBanner from './components/OfflineBanner';
import AppErrorBoundary from './components/AppErrorBoundary';

const AppRoutes = () => {
  const token = readStoredJwt();
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
      <ThreeDBackground />
      <Navbar />
      <OfflineBanner />
      <OnlineUsers username={username} />
      <AppErrorBoundary>
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
      </AppErrorBoundary>
    </>
  );
};

const App = () => (
  <Router>
    <AppRoutes />
  </Router>
);

export default App;
