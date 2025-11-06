import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';

// 1. Importar componentes MUI
import { TextField, Button, Box, Typography, Link, CircularProgress } from '@mui/material';

const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // Adicionar estado de loading
  const [stage, setStage] = useState<'request' | 'verify' | 'reset'>('request');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  
  // API
  // import dynamically to avoid circular imports at top-level in some setups
  // but it's okay to import directly — project already has api instance.
  // We'll import at module top instead for clarity.
  const { showNotification } = useNotification();

  const handleRequestCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // Request backend to generate & send a reset code via email
      // backend endpoint: POST /api/auth/forgot-password
      // api instance is imported below
      await api.post('/auth/forgot-password', { email });
      showNotification('Se o e-mail estiver cadastrado, um código foi enviado.', 'success');
      setStage('verify');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao solicitar código de recuperação.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/validate-reset-code', { email, code });
      showNotification('Código validado. Agora defina sua nova senha.', 'success');
      setStage('reset');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Código inválido ou expirado.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

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
      const msg = error?.response?.data?.message || 'Erro ao redefinir a senha.';
      showNotification(msg, 'error');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar Senha">
      {stage === 'request' && (
        <>
          <Typography component="p" align="center" sx={{ mb: 2 }}>
            Digite seu e-mail para enviarmos um código de recuperação.
          </Typography>
          <Box component="form" noValidate onSubmit={handleRequestCode} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de E-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading} // Desabilitar enquanto carrega
            />

            <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ py: 1.5 }}
                disabled={loading} // Desabilitar botão no loading
              >
                Enviar Código
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>

            <Typography variant="body2" align="center">
              Lembrou da senha?{' '}
              <Link component={RouterLink} to="/login" variant="body2">
                Faça login
              </Link>
            </Typography>
          </Box>
        </>
      )}

      {stage === 'verify' && (
        <>
          <Typography component="p" align="center" sx={{ mb: 2 }}>
            Insira o código que você recebeu por e-mail.
          </Typography>
          <Box component="form" noValidate onSubmit={handleVerifyCode} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="code"
              label="Código"
              name="code"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />

            <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
              <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }} disabled={loading}>
                Verificar Código
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>

            <Typography variant="body2" align="center">
              Não recebeu?{' '}
              <Link component="button" onClick={() => handleRequestCode()} variant="body2">
                Reenviar código
              </Link>
            </Typography>
          </Box>
        </>
      )}

      {stage === 'reset' && (
        <>
          <Typography component="p" align="center" sx={{ mb: 2 }}>
            Digite sua nova senha.
          </Typography>
          <Box component="form" noValidate onSubmit={handleResetPassword} sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Nova Senha"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirmar Nova Senha"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />

            <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
              <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }} disabled={loading}>
                Redefinir Senha
              </Button>
              {loading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px',
                  }}
                />
              )}
            </Box>

            <Typography variant="body2" align="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Voltar para o Login
              </Link>
            </Typography>
          </Box>
        </>
      )}
    </AuthLayout>
  );
};

export default RecuperarSenha;