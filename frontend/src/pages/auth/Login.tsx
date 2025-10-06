import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(email, senha);
      showNotification('Login realizado com sucesso!', 'success');
      if (userData.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      showNotification('E-mail ou senha inválidos.', 'error');
    }
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
          <form onSubmit={handleSubmit}>
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
                <label htmlFor="senha">Senha</label>
                <input
                    type="password"
                    id="senha"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className="auth-button">
                Entrar
            </button>
          </form>
          <div className="auth-links">
            <Link to="/recuperar-senha">Esqueceu a senha?</Link>
            <span> | </span>
            <Link to="/registro">Não tem uma conta? Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;