import React, { useState } from "react";
import AuthModal from "../components/AuthModal";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(!isAuthenticated);

  const handleLoginSuccess = () => {
    setModalOpen(false);
    window.location.reload();
  };

  if (isAuthenticated) {
    return children;
  }

  return (
    <AuthModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      onLoginSuccess={handleLoginSuccess}
    />
  );
};

export default ProtectedRoute;
