// Importa React, hooks e componentes de UI.
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';

import { TextField, Button, Box, Typography, Link, CircularProgress } from '@mui/material';

/**
 * @component RecuperarSenha
 * @description Uma página com um fluxo de múltiplos estágios para recuperação de senha.
 * 1. Solicita o e-mail do usuário.
 * 2. Pede o código de verificação enviado por e-mail.
 * 3. Permite a definição de uma nova senha.
 */
const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState<'request' | 'verify' | 'reset'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // 1. Solicita o envio do código de recuperação para o e-mail do usuário.
  const handleRequestCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      showNotification('Se o e-mail estiver cadastrado, um código foi enviado.', 'success');
      setStage('verify');
    } catch (error: any) {
      showNotification(error?.response?.data?.message || 'Erro ao solicitar código.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verifica se o código inserido pelo usuário é válido.
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/validate-reset-code', { email, code });
      showNotification('Código validado. Defina sua nova senha.', 'success');
      setStage('reset');
    } catch (error: any) {
      showNotification(error?.response?.data?.message || 'Código inválido ou expirado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Redefine a senha com o novo valor fornecido.
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showNotification('As senhas não coincidem.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      showNotification('Senha redefinida com sucesso! Você já pode fazer login.', 'success');
      navigate('/login');
    } catch (error: any) {
      showNotification(error?.response?.data?.message || 'Erro ao redefinir a senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar Senha">
      {/* Estágio 1: Solicitar código */}
      {stage === 'request' && (
        <>
          <Typography component="p" align="center" sx={{ mb: 2 }}>Digite seu e-mail para enviarmos um código de recuperação.</Typography>
          <Box component="form" noValidate onSubmit={handleRequestCode} sx={{ mt: 1, width: '100%' }}>
            <TextField margin="normal" required fullWidth id="email" label="Endereço de E-mail" name="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
            <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
              <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }} disabled={loading}>Enviar Código</Button>
              {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
            </Box>
            <Typography variant="body2" align="center">Lembrou da senha?{' '}<Link component={RouterLink} to="/login" variant="body2">Faça login</Link></Typography>
          </Box>
        </>
      )}

      {/* Estágio 2: Verificar código */}
      {stage === 'verify' && (
        <>
          <Typography component="p" align="center" sx={{ mb: 2 }}>Insira o código que você recebeu por e-mail.</Typography>
          <Box component="form" noValidate onSubmit={handleVerifyCode} sx={{ mt: 1, width: '100%' }}>
            <TextField margin="normal" required fullWidth id="code" label="Código" name="code" autoFocus value={code} onChange={(e) => setCode(e.target.value)} disabled={loading} />
            <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
              <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }} disabled={loading}>Verificar Código</Button>
              {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
            </Box>
            <Typography variant="body2" align="center">Não recebeu?{' '}<Link component="button" onClick={() => handleRequestCode()} variant="body2">Reenviar código</Link></Typography>
          </Box>
        </>
      )}

      {/* Estágio 3: Redefinir senha */}
      {stage === 'reset' && (
        <>
          <Typography component="p" align="center" sx={{ mb: 2 }}>Digite sua nova senha.</Typography>
          <Box component="form" noValidate onSubmit={handleResetPassword} sx={{ mt: 1, width: '100%' }}>
            <TextField margin="normal" required fullWidth name="newPassword" label="Nova Senha" type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={loading} autoFocus />
            <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirmar Nova Senha" type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
            <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
              <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }} disabled={loading}>Redefinir Senha</Button>
              {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
            </Box>
            <Typography variant="body2" align="center"><Link component={RouterLink} to="/login" variant="body2">Voltar para o Login</Link></Typography>
          </Box>
        </>
      )}
    </AuthLayout>
  );
};

export default RecuperarSenha;