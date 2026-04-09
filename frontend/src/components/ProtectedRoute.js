import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E0D8C8] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#C8A25F] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#2B3033] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
