import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Auth.css';

const ResetarSenha = () => {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const { token } = useParams<{ token: string }>(); // Pega o token da URL
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      addNotification('As senhas não coincidem.', 'error');
      return;
    }
    try {
      await api.post(`/auth/reset-password/${token}`, { senha });
      addNotification('Sua senha foi redefinida com sucesso!', 'success');
      navigate('/login');
    } catch (error) {
      addNotification('Token inválido ou expirado. Por favor, solicite um novo link.', 'error');
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
          <h2>Redefinir Senha</h2>
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
      </div>
    </div>
  );
};

export default ResetarSenha;