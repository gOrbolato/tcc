
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Páginas Públicas
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import RecuperarSenha from '../pages/auth/RecuperarSenha';
import ResetarSenha from '../pages/auth/ResetarSenha';

// Páginas do Usuário Comum
import Dashboard from '../pages/user/Dashboard';
import Avaliacao from '../pages/user/Avaliacao';
import Perfil from '../pages/user/Perfil';

// Páginas do Administrador
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import InstitutionCourseManagement from '../pages/InstitutionCourseManagement';
import VisualizarAvaliacoes from '../pages/admin/VisualizarAvaliacoes'; // Importa a nova página

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/resetar-senha/:token" element={<ResetarSenha />} />

      {/* Rotas Protegidas para Usuários Logados */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/nova-avaliacao" 
        element={<ProtectedRoute><Avaliacao /></ProtectedRoute>} 
      />
      <Route 
        path="/perfil" 
        element={<ProtectedRoute><Perfil /></ProtectedRoute>} 
      />

      {/* Rotas Protegidas para Administradores */}
      <Route 
        path="/admin/dashboard" 
        element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/gerenciar-usuarios" 
        element={<ProtectedRoute adminOnly={true}><AdminUserManagement /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/gerenciar-instituicoes" 
        element={<ProtectedRoute adminOnly={true}><InstitutionCourseManagement /></ProtectedRoute>} 
      />
      <Route 
        path="/admin/visualizar-avaliacoes" 
        element={<ProtectedRoute adminOnly={true}><VisualizarAvaliacoes /></ProtectedRoute>} 
      />

      {/* Rota de fallback (opcional) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
