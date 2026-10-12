import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Books from './pages/Books';
import AdminBooks from './pages/AdminBooks';
import Borrowings from './pages/Borrowings';
import Fines from './pages/Fines';

// Styles
import './styles/global.css';

// Root redirector based on authenticated role
const RootRedirector = () => {
  const { isAuthenticated, isAdmin, isStudent } = useAuth();

  if (isAuthenticated) {
    if (isAdmin) return <Navigate to="/admin" replace />;
    if (isStudent) return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/books" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirector />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/books" element={<Books />} />

            {/* Student Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminBooks />
                </ProtectedRoute>
              }
            />

            {/* Shared Authenticated Routes */}
            <Route
              path="/borrowings"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <Borrowings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fines"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                  <Fines />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 / Unknown Route */}
            <Route path="*" element={<RootRedirector />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
