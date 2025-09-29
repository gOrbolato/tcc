import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { useNotification } from '../contexts/NotificationContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        showNotification('Login realizado com sucesso!', 'success');
        navigate('/dashboard');
      } else {
        showNotification(data.message || 'Erro ao fazer login.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao tentar fazer login.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <Link to="/">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit" disabled={loading}>Entrar</button>
          {loading && <p>Entrando...</p>}
          <Link className="auth-link" to="/recuperar-senha">
            Esqueceu sua senha?
          </Link>
          <p className="auth-link">
            Não tem uma conta? <Link to="/registro">Cadastre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
};export default Login;
