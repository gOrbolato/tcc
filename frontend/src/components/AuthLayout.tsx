
import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/styles/Auth.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="auth-container">
      <div className="auth-panel">
        <Link to="/" className="auth-home-link">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div className="auth-form-container">
        <div className="auth-form">
          <h2>{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
