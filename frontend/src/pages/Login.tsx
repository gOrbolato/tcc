import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de chamada de API
    try {
      // const response = await api.post('/login', { email, password });
      // if (response.data.token) {
      //   localStorage.setItem('token', response.data.token);
      //   navigate('/dashboard');
      // }
      console.log('Login attempt with:', { email, password });
      // Simulação de erro
      if (email !== 'teste@teste.com' || password !== 'Senha123!') {
        setError('Usuário ou senha inválidos.');
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login.');
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
          {error && <p className="error-message">{error}</p>}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="password-container">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button type="submit">Entrar</button>
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
};

export default Login;
