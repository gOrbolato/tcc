import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../assets/styles/Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Redireciona para a home ao sair
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        Avaliação Educacional
      </Link>
      <nav className="header-nav">
        
        {user && (
          <div className="user-info">
            <span>Olá, {user.nome}!</span>
            {user.isAdmin ? (
              <Link to="/admin/dashboard">Painel Admin</Link>
            ) : (
              <Link to="/dashboard">Minhas Avaliações</Link>
            )}
            <button onClick={handleLogout} className="logout-button">
              Sair
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;