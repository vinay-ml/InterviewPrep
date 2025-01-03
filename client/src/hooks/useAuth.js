import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState(null);

  useEffect(() => {
    const tokenData = localStorage.getItem("token");

    if (tokenData) {
      try {
        const { token, expiry } = JSON.parse(tokenData);
        const now = new Date().getTime();

        if (now > expiry) {
          // Token has expired
          console.warn("Token expired, removing it from localStorage");
          localStorage.removeItem("token");
          setIsAuthenticated(false);
        } else {
          // Decode token and set state
          const decoded = jwtDecode(token);
          setAccessCode(decoded.accessCode);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Invalid token or token parsing error:", error);
        localStorage.removeItem("token");
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
