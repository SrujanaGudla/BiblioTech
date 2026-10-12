import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Verifying session..." />;
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is specified and user role is not allowed:
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    if (role === 'STUDENT') {
      // If student attempts to access admin routes, redirect to student dashboard
      return <Navigate to="/dashboard" replace />;
    } else if (role === 'ADMIN') {
      // If admin attempts to access student-specific routes, redirect to admin dashboard
      return <Navigate to="/admin" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
