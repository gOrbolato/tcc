
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("DEBUG ProtectedRoute: isLoading=", isLoading, "user=", user, "adminOnly=", adminOnly);

  if (isLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando autenticação...</p></div></section>;
  }

  if (!user) {
    console.log("DEBUG ProtectedRoute: Usuário não logado, redirecionando para /login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !user.isAdmin) {
    console.log("DEBUG ProtectedRoute: Usuário não é admin, redirecionando para /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("DEBUG ProtectedRoute: Acesso permitido.");
  return children;
};
