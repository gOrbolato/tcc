import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showResetForm, setShowResetForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (token) {
      setShowResetForm(true);
    }
  }, [token]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(data.message + ' Token para teste: ' + data.resetToken, 'info');
        // Em uma aplicação real, o token não seria exibido aqui, mas enviado por e-mail.
        // setShowResetForm(true); // Para testar, pode-se ir direto para o formulário de reset
      } else {
        showNotification(data.message || 'Erro ao solicitar recuperação de senha.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao tentar solicitar a recuperação de senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmNewPassword) {
      showNotification('As senhas não coincidem.', 'error');
      setLoading(false);
      return;
    }

    if (!token) {
      showNotification('Token de redefinição de senha não encontrado.', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Senha redefinida com sucesso! Você será redirecionado para o login.', 'success');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        showNotification(data.message || 'Erro ao redefinir senha.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao tentar redefinir a senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <Link to="/">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div>
        {!showResetForm ? (
          <form onSubmit={handleForgotPassword}>
            <h2>Recuperar Senha</h2>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>Enviar link de recuperação</button>
            {loading && <p>Enviando...</p>}
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <h2>Redefinir Senha</h2>
            <input
              type="password"
              placeholder="Nova Senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Confirmar Nova Senha"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading}>Redefinir Senha</button>
            {loading && <p>Redefinindo...</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default RecuperarSenha;
