import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/styles/Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de login aqui
    // Se o login for bem-sucedido:
    navigate('/dashboard');
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <Link to="/" className="auth-logo">
          Avaliação Educacional
        </Link>
      </div>
      <div className="auth-main">
        <div className="auth-form-container">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <button type="submit" className="auth-button">
              Entrar
            </button>
          </form>
          <div className="auth-links">
            <Link to="/registro">Não tem uma conta? Cadastre-se</Link>
            <br/>
            <Link to="/recuperar-senha">Esqueceu sua senha?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;