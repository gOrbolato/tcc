// src/routes/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { motion } from 'framer-motion';

// --- Importações das Páginas ---
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import RecuperarSenha from '../pages/auth/RecuperarSenha';
import ResetarSenha from '../pages/auth/ResetarSenha';
import ValidarCodigoDesbloqueio from '../pages/auth/ValidarCodigoDesbloqueio'; // <-- ADICIONADO

import Dashboard from '../pages/user/Dashboard';
import Avaliacao from '../pages/user/Avaliacao';
import Perfil from '../pages/user/Perfil';
import AvaliacaoDetalhes from '../pages/user/AvaliacaoDetalhes';

import AdminDashboard from '../pages/admin/AdminDashboard';
// import AdminPerfil from '../pages/admin/AdminPerfil'; // REMOVIDO
import AdminUserManagement from '../pages/admin/AdminUserManagement';
import InstitutionCourseManagement from '../pages/InstitutionCourseManagement';
import Reports from '../pages/admin/reports';
// AdminActions and VisualizarAvaliacoes pages removed per request
// --- Fim das Importações ---

// 1. Wrapper de animação para as páginas
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

// 2. Aceitar 'location' como prop
const AppRoutes = ({ location }: { location: Location }) => {
  return (
    // 3. Passar 'location' e 'key' para o <Routes>
    <Routes location={location} key={location.pathname}>
      
      {/* Rotas Públicas */}
      {/* O AuthLayout já cuida da tela inteira, não precisa de PageWrapper */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/resetar-senha/:token" element={<ResetarSenha />} />
      <Route path="/validar-codigo" element={<ValidarCodigoDesbloqueio />} /> {/* <-- ADICIONADO */}

      {/* Páginas com animação */}
      <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />

      {/* Rotas Protegidas para Usuários Logados */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><PageWrapper><Dashboard /></PageWrapper></ProtectedRoute>}
      />
      <Route
        path="/nova-avaliacao" // Ajuste: Seu código antigo tinha /nova-avaliacao e /avaliacao/:id
        element={<ProtectedRoute><PageWrapper><Avaliacao /></PageWrapper></ProtectedRoute>}
      />
      <Route
        path="/avaliacao/:id" // Rota para avaliação específica
        element={<ProtectedRoute><PageWrapper><Avaliacao /></PageWrapper></ProtectedRoute>}
      />
      <Route
        path="/avaliacao/detalhes/:id" // Rota para ver detalhes (era /avaliacao/:id no seu código)
        element={<ProtectedRoute><PageWrapper><AvaliacaoDetalhes /></PageWrapper></ProtectedRoute>}
      />
      <Route
        path="/perfil"
        element={<ProtectedRoute><PageWrapper><Perfil /></PageWrapper></ProtectedRoute>}
      />

      {/* Rotas Protegidas para Administradores */}
      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute adminOnly={true}><PageWrapper><AdminDashboard /></PageWrapper></ProtectedRoute>}
      />
      {/*
      <Route
        path="/admin/perfil"
        element={<ProtectedRoute adminOnly={true}><PageWrapper><AdminPerfil /></PageWrapper></ProtectedRoute>}
      />
      */}
      <Route
        path="/admin/gerenciar-usuarios"
        element={<ProtectedRoute adminOnly={true}><PageWrapper><AdminUserManagement /></PageWrapper></ProtectedRoute>}
      />
      <Route
        path="/admin/gerenciar-entidades" // padronizado: gerenciar-entidades
        element={<ProtectedRoute adminOnly={true}><PageWrapper><InstitutionCourseManagement /></PageWrapper></ProtectedRoute>}
      />
      <Route
        path="/admin/relatorios"
        element={<ProtectedRoute adminOnly={true}><PageWrapper><Reports /></PageWrapper></ProtectedRoute>}
      />
      {/* /admin/logs and /admin/visualizar-avaliacoes removed */}

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;