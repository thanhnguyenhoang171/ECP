import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('access_token');

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, đá về trang login
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;