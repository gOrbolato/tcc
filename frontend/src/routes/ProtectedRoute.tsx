// Importa React, hooks de roteamento e contexto, e componentes do Material-UI.
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

// Interface para as propriedades do componente.
interface ProtectedRouteProps {
  adminOnly?: boolean; // Flag para indicar se a rota é exclusiva para administradores.
  children?: React.ReactNode; // Conteúdo filho a ser renderizado se a proteção passar.
}

/**
 * @component ProtectedRoute
 * @description Um componente de wrapper que protege rotas. Ele verifica se o usuário
 * está autenticado e, opcionalmente, se é um administrador.
 * Enquanto o status de autenticação está sendo verificado, exibe um spinner de carregamento.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false, children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Exibe um spinner de carregamento enquanto o contexto de autenticação está inicializando.
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Se o usuário não estiver autenticado, redireciona para a página de login.
  // `state={{ from: location }}` é usado para redirecionar de volta à página original após o login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a rota é exclusiva para administradores e o usuário não é um, redireciona para o dashboard do usuário.
  if (adminOnly && !user?.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Se a autenticação e a autorização passarem, renderiza o conteúdo filho.
  // Se `children` for fornecido, ele é renderizado. Caso contrário, renderiza `<Outlet />` para rotas aninhadas.
  return <>{children ?? <Outlet />}</>;
};

export default ProtectedRoute;