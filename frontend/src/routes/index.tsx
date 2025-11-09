// src/routes/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { motion } from 'framer-motion';

// --- Importações dos Layouts ---
import UserLayout from '../layouts/UserLayout';
import AdminLayout from '../layouts/AdminLayout';

// --- Importações das Páginas ---
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import RecuperarSenha from '../pages/auth/RecuperarSenha';
import ResetarSenha from '../pages/auth/ResetarSenha';
import ValidarCodigoDesbloqueio from '../pages/auth/ValidarCodigoDesbloqueio';

import Dashboard from '../pages/user/Dashboard';
import Avaliacao from '../pages/user/Avaliacao';
import Perfil from '../pages/user/Perfil';
import AvaliacaoDetalhes from '../pages/user/AvaliacaoDetalhes';

import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import InstitutionCourseManagement from '../pages/InstitutionCourseManagement';
import Reports from '../pages/admin/reports';
import SetNewPassword from '../pages/auth/SetNewPassword'; // NEW IMPORT
// --- Fim das Importações ---

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

const AppRoutes = ({ location }: { location: Location }) => {
  return (
    <Routes location={location} key={location.pathname}>
      
      {/* Rotas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/resetar-senha/:token" element={<ResetarSenha />} />
      <Route path="/validar-codigo" element={<ValidarCodigoDesbloqueio />} />
      <Route path="/set-new-password" element={<SetNewPassword />} /> {/* NEW ROUTE */}

      {/* Rota Home */}
      <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

      {/* Rotas de Usuário com Layout */}
      <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/nova-avaliacao" element={<PageWrapper><Avaliacao /></PageWrapper>} />
        <Route path="/avaliacao/:id" element={<PageWrapper><Avaliacao /></PageWrapper>} />
        <Route path="/avaliacao/detalhes/:id" element={<PageWrapper><AvaliacaoDetalhes /></PageWrapper>} />
        <Route path="/perfil" element={<PageWrapper><Perfil /></PageWrapper>} />
      </Route>

      {/* Rotas de Admin com Layout */}
      <Route element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        <Route path="/admin/gerenciar-usuarios" element={<PageWrapper><AdminUserManagement /></PageWrapper>} />
        <Route path="/admin/gerenciar-entidades" element={<PageWrapper><InstitutionCourseManagement /></PageWrapper>} />
        <Route path="/admin/relatorios" element={<PageWrapper><Reports /></PageWrapper>} />
      </Route>

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;