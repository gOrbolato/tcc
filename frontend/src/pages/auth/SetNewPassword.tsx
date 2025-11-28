// Importa React, hooks e componentes de UI.
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * @component SetNewPassword
 * @description Esta página permite ao usuário definir uma nova senha após validar
 * um código de recuperação. O e-mail e o código são lidos dos parâmetros da URL.
 */
const SetNewPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Extrai e-mail e código dos parâmetros da URL.
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const code = queryParams.get('code');

  // Efeito que valida o e-mail e o código assim que a página carrega.
  useEffect(() => {
    if (!email || !code) {
      showNotification('Link de redefinição inválido.', 'error');
      navigate('/recuperar-senha');
      return;
    }
    const validateCodeOnLoad = async () => {
      try {
        setLoading(true);
        await api.post('/auth/validate-reset-code', { email, code });
        setValidationError(null);
      } catch (error: any) {
        showNotification(error.response?.data?.message || 'Código inválido ou expirado.', 'error');
        navigate('/recuperar-senha');
      } finally {
        setLoading(false);
      }
    };
    validateCodeOnLoad();
  }, [email, code, navigate, showNotification]);

  // Função para validar a força da senha.
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
    if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos 1 número.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'A senha deve conter pelo menos 1 caractere especial.';
    if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos 1 letra maiúscula.';
    return null;
  };

  // Lida com a submissão do formulário para redefinir a senha.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setValidationError(passwordError);
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('As senhas não coincidem.');
      return;
    }
    if (!email || !code) {
      setValidationError('Informações de redefinição incompletas.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, newPassword });
      showNotification('Senha redefinida com sucesso! Faça login com sua nova senha.', 'success');
      navigate('/login');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Erro ao redefinir a senha.';
      setValidationError(msg);
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !validationError) {
    return <AuthLayout title="Redefinir Senha"><Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box></AuthLayout>;
  }

  return (
    <AuthLayout title="Redefinir Senha">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Insira e confirme sua nova senha.</Typography>
        <TextField margin="normal" required fullWidth name="newPassword" label="Nova Senha" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirmar Nova Senha" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        {validationError && <Alert severity="error" sx={{ mt: 2 }}>{validationError}</Alert>}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Redefinir Senha'}
          </Button>
        </motion.div>
      </Box>
    </AuthLayout>
  );
};

export default SetNewPassword;
