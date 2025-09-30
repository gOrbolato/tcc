import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import '../../assets/styles/Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Usando 'email' em vez de 'ra' para fazer o login
      const userData = await login(email, senha);
      addNotification('Login realizado com sucesso!', 'success');
      if (userData.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      addNotification('E-mail ou senha inválidos.', 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel">
        <Link to="/" className="auth-home-link">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email" // Alterado para 'email' para melhor validação do navegador
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>
          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Lembrar-me</label>
            </div>
            <Link to="/recuperar-senha">Esqueci minha senha</Link>
          </div>
          <button type="submit">Entrar</button>
          <p className="auth-redirect">
            Não tem uma conta? <Link to="/registro">Registre-se</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;