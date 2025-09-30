import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Registro from '../pages/auth/Registro';
import RecuperarSenha from '../pages/auth/RecuperarSenha';
import Dashboard from '../pages/user/Dashboard';
import Perfil from '../pages/user/Perfil';
import Avaliacao from '../pages/user/Avaliacao';
import AdminDashboard from '../pages/admin/AdminDashboard';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/avaliacao" element={<Avaliacao />} />
      <Route path="/admin/AdminDashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AppRoutes;