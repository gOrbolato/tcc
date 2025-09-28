import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header>
      <nav>
        <Link to="/">Avaliação Educacional</Link>
        <div>
          <Link to="/login">Login</Link>
          <Link to="/registro">Criar Conta</Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;
