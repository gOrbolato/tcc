import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Auth.css';

const RecuperarSenha = () => {
  const [email, setEmail] = useState('');
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      addNotification(
        'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.',
        'success'
      );
    } catch (error) {
      addNotification(
        'Ocorreu um erro. Por favor, tente novamente mais tarde.',
        'error'
      );
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
          <h2>Recuperar Senha</h2>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555' }}>
            Digite seu e-mail cadastrado e enviaremos um link para você redefinir sua senha.
          </p>
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
          <button type="submit">Enviar Link</button>
          <p className="auth-redirect">
            Lembrou sua senha? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RecuperarSenha;