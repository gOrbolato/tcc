// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  adminOnly?: boolean;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false, children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // 1. Usar CircularProgress do MUI para o estado de loading
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 200px)', // Altura da tela menos header/footer
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 2. Lógica de autenticação
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Lógica de Admin
  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />; // Redireciona se não for admin
  }

  // If children are provided, render them (used in routes as a wrapper). Otherwise render <Outlet />.
  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;