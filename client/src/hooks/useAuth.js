import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getStoredJwtToken } from '../utils/authToken';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState(null);

  useEffect(() => {
    const tokenData = localStorage.getItem('token');
    const jwtToken = getStoredJwtToken();

    if (tokenData && jwtToken) {
      try {
        let expiry = null;
        try {
          const parsed = JSON.parse(tokenData);
          if (parsed && typeof parsed === 'object' && typeof parsed.expiry === 'number') {
            expiry = parsed.expiry;
          }
        } catch (_) {
          // Raw token format does not include expiry.
        }

        if (expiry && new Date().getTime() > expiry) {
          console.warn('Token expired, removing it from localStorage');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          return;
        }

        const decoded = jwtDecode(jwtToken);
        setAccessCode(decoded.accessCode);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid token or token parsing error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } else {
      // No token found
      setIsAuthenticated(false);
    }
  }, []);

  return { isAuthenticated, accessCode };
};

export default useAuth;
