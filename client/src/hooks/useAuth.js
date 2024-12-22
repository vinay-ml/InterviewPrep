import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAccessCode(decoded.accessCode);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return { isAuthenticated, accessCode };
};

export default useAuth;
