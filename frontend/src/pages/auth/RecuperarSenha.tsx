import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';

const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState(1); // 1: pedir email, 2: pedir código
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      showNotification('Se o e-mail estiver cadastrado, um código foi enviado.', 'success');
      setStep(2); // Avança para o passo de inserir o código
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Erro ao enviar solicitação.', 'error');
    }
  };

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/validate-reset-code', { email, code });
      showNotification('Código validado com sucesso!', 'success');
      navigate('/resetar-senha', { state: { email, code } }); // Redireciona para a página de reset
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Código inválido ou expirado.', 'error');
    }
  };

  return (
    <AuthLayout title="Recuperar Senha">
      {step === 1 ? (
        <form onSubmit={handleSendCode}>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555' }}>
            Digite seu e-mail cadastrado e enviaremos um código para você redefinir sua senha.
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
          <button type="submit">Enviar Código</button>
          <p className="auth-redirect">
            Lembrou sua senha? <Link to="/login">Faça login</Link>
          </p>
        </form>
      ) : (
        <form onSubmit={handleValidateCode}>
          <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#555' }}>
            Um código foi enviado para {email}. Digite-o abaixo para continuar.
          </p>
          <div className="form-group">
            <label htmlFor="code">Código de Recuperação</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={7} // 3 letras + 4 números
            />
          </div>
          <button type="submit">Validar Código</button>
          <p className="auth-redirect">
            <button type="button" onClick={() => setStep(1)} style={{background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer'}}>← Voltar</button>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default RecuperarSenha;