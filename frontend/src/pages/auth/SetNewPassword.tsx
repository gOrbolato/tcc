import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import { TextField, Button, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';

const SetNewPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const code = queryParams.get('code');

  useEffect(() => {
    if (!email || !code) {
      showNotification('Link de redefinição de senha inválido ou incompleto.', 'error');
      navigate('/recuperar-senha');
    }
    // Optionally, validate the code immediately on page load
    // This would prevent users from seeing the form if the code is already expired/invalid
    const validateCodeOnLoad = async () => {
      try {
        setLoading(true);
        await api.post('/auth/validate-reset-code', { email, code });
        setValidationError(null); // Clear any previous errors
      } catch (error: any) {
        showNotification(error.response?.data?.message || 'Código de redefinição inválido ou expirado.', 'error');
        navigate('/recuperar-senha');
      } finally {
        setLoading(false);
      }
    };
    validateCodeOnLoad();
  }, [email, code, navigate, showNotification]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'A senha deve ter pelo menos 8 caracteres.';
    }
    if (!/[0-9]/.test(password)) {
      return 'A senha deve conter pelo menos 1 número.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'A senha deve conter pelo menos 1 caractere especial.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'A senha deve conter pelo menos 1 letra maiúscula.';
    }
    return null;
  };

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
      await api.post('/auth/reset-password', { email, code, newPassword }); // Pass code for server-side validation
      showNotification('Senha redefinida com sucesso! Faça login com sua nova senha.', 'success');
      navigate('/login');
    } catch (error: any) {
      setValidationError(error.response?.data?.message || 'Erro ao redefinir a senha.');
      showNotification(error.response?.data?.message || 'Erro ao redefinir a senha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !validationError) { // Show loading spinner only if no validation error and still loading
    return (
      <AuthLayout title="Redefinir Senha">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Redefinir Senha">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Por favor, insira e confirme sua nova senha.
        </Typography>
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
          InputLabelProps={{ style: { color: 'rgba(15,23,32,0.6)' } }}
          inputProps={{ style: { color: 'rgba(15,23,32,0.95)' } }}
          sx={{ '&& .MuiOutlinedInput-root': { background: 'rgba(244,246,248,0.9)', borderRadius: 3 }, '&& .MuiOutlinedInput-input': { color: 'rgba(15,23,32,0.95)' } }}
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
          InputLabelProps={{ style: { color: 'rgba(15,23,32,0.6)' } }}
          inputProps={{ style: { color: 'rgba(15,23,32,0.95)' } }}
          sx={{ '&& .MuiOutlinedInput-root': { background: 'rgba(244,246,248,0.9)', borderRadius: 3 }, '&& .MuiOutlinedInput-input': { color: 'rgba(15,23,32,0.95)' } }}
        />
        {validationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Redefinir Senha'}
          </Button>
        </motion.div>
      </Box>
    </AuthLayout>
  );
};

export default SetNewPassword;
