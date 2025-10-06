import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout'; // Importando o layout

const ResetarSenha = () => {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      showNotification('As senhas não coincidem.', 'error');
      return;
    }
    try {
      await api.post(`/auth/reset-password/${token}`, { senha });
      showNotification('Sua senha foi redefinida com sucesso!', 'success');
      navigate('/login');
    } catch (error) {
      showNotification('Token inválido ou expirado. Por favor, solicite um novo link.', 'error');
    }
  };

  return (
    <AuthLayout title="Redefinir Senha">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="senha">Nova Senha</label>
          <input
            type="password"
            id="senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
          <input
            type="password"
            id="confirmarSenha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            required
          />
        </div>
        <button type="submit">Salvar Nova Senha</button>
      </form>
    </AuthLayout>
  );
};

export default ResetarSenha;