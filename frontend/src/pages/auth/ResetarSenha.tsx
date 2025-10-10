import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';

const ResetarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.email && location.state.code) {
      setEmail(location.state.email);
      setCode(location.state.code);
    } else {
      showNotification('Acesso inválido à página de redefinição de senha.', 'error');
      navigate('/recuperar-senha');
    }
  }, [location.state, navigate, showNotification]);

  const validatePassword = (password: string) => {
    const hasNumber = /[0-9]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    return hasNumber && hasUpperCase && hasSpecialChar && isLongEnough;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('As senhas não coincidem.', 'error');
      return;
    }
    if (!validatePassword(newPassword)) {
      showNotification('A senha deve ter pelo menos 8 caracteres, 1 número, 1 letra maiúscula e 1 caractere especial.', 'error');
      return;
    }
    try {
      await api.post('/auth/reset-password', { email, code, newPassword });
      showNotification('Sua senha foi redefinida com sucesso!', 'success');
      navigate('/login');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Erro ao redefinir a senha.', 'error');
    }
  };

  return (
    <AuthLayout title="Redefinir Senha">
      <form onSubmit={handleSubmit}>
        <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555' }}>
          Digite sua nova senha. Ela deve ter pelo menos 8 caracteres, 1 número, 1 letra maiúscula e 1 caractere especial.
        </p>
        <div className="form-group">
          <label htmlFor="newPassword">Nova Senha</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Salvar Nova Senha</button>
        <p className="auth-redirect">
          Lembrou sua senha? <Link to="/login">Faça login</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default ResetarSenha;