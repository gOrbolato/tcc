import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/App.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          Avaliação Educacional
        </Link>
        <nav>
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/registro" className="nav-link-special">
            Criar Conta
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;