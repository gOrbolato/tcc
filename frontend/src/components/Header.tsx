import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/App.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Volta para a home após o logout
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          Avaliação Educacional
        </Link>
        <nav>
          {user ? (
            <>
              <span style={{ marginRight: '1rem' }}>Olá, {user.nome}!</span>
              {user.isAdmin ? (
                <Link to="/admin/dashboard" className="nav-link">Painel Admin</Link>
              ) : (
                <Link to="/dashboard" className="nav-link">Minhas Avaliações</Link>
              )}
              <button onClick={handleLogout} className="nav-link-special">Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/registro" className="nav-link-special">Criar Conta</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;