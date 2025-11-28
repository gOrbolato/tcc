// Importa React e componentes de roteamento e animação.
import React from 'react';
import { Routes, Route, Navigate, Location } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { motion } from 'framer-motion';

// --- Layouts ---
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// --- Páginas Públicas e de Autenticação ---
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import RecuperarSenha from '../pages/auth/RecuperarSenha';
import ResetarSenha from '../pages/auth/ResetarSenha';
import ValidarCodigoDesbloqueio from '../pages/auth/ValidarCodigoDesbloqueio';
import SetNewPassword from '../pages/auth/SetNewPassword';

// --- Páginas do Usuário Logado ---
import Dashboard from '../pages/user/Dashboard';
import Avaliacao from '../pages/user/Avaliacao';
import Perfil from '../pages/user/Perfil';
import AvaliacaoDetalhes from '../pages/user/AvaliacaoDetalhes';

// --- Páginas do Administrador ---
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import InstitutionCourseManagement from '../pages/InstitutionCourseManagement';
import Reports from '../pages/admin/reports';

/**
 * @component PageWrapper
 * @description Um HOC (High-Order Component) que envolve as páginas com uma animação
 * de transição suave (fade in e slide para cima).
 */
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.25 }}
  >
    {children}
  </motion.div>
);

/**
 * @component AppRoutes
 * @description O componente central que define todas as rotas da aplicação,
 * organizando-as em públicas, de usuário e de administrador.
 */
const AppRoutes = ({ location }: { location: Location }) => {
  return (
    <Routes location={location} key={location.pathname}>
      
      {/* --- Rotas Públicas --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/resetar-senha/:token" element={<ResetarSenha />} />
      <Route path="/validar-codigo" element={<ValidarCodigoDesbloqueio />} />
      <Route path="/set-new-password" element={<SetNewPassword />} />
      <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

      {/* --- Rotas Protegidas do Usuário --- */}
      {/* Todas as rotas aqui dentro usarão o `UserLayout` e exigirão autenticação. */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/nova-avaliacao" element={<PageWrapper><Avaliacao /></PageWrapper>} />
        <Route path="/avaliacao/:id" element={<PageWrapper><Avaliacao /></PageWrapper>} />
        <Route path="/avaliacao/detalhes/:id" element={<PageWrapper><AvaliacaoDetalhes /></PageWrapper>} />
        <Route path="/perfil" element={<PageWrapper><Perfil /></PageWrapper>} />
      </Route>

      {/* --- Rotas Protegidas do Administrador --- */}
      {/* Todas as rotas aqui dentro usarão o `AdminLayout` e exigirão autenticação de admin. */}
      <Route element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/admin/gerenciar-usuarios" element={<PageWrapper><AdminUserManagement /></PageWrapper>} />
        <Route path="/admin/gerenciar-entidades" element={<PageWrapper><InstitutionCourseManagement /></PageWrapper>} />
        <Route path="/admin/relatorios" element={<PageWrapper><Reports /></PageWrapper>} />
      </Route>

      {/* Rota de Fallback: redireciona qualquer URL não encontrada para a página inicial. */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;