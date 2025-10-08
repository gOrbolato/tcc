
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';

const RecuperarSenha = () => {
  const [email, setEmail] = useState('');
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      showNotification(
        'Se o e-mail estiver cadastrado, um link de recuperação foi enviado.',
        'success'
      );
    } catch (error) {
      showNotification(
        'Ocorreu um erro. Por favor, tente novamente mais tarde.',
        'error'
      );
    }
  };

  return (
    <AuthLayout title="Recuperar Senha">
      <form onSubmit={handleSubmit}>
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
    </AuthLayout>
  );
};

export default RecuperarSenha;
