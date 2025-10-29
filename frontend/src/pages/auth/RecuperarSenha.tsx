import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';

// 1. Importar componentes MUI
import { TextField, Button, Box, Typography, Link, CircularProgress } from '@mui/material';

const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // Adicionar estado de loading
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simular chamada de API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showNotification('Link de recuperação enviado para o seu e-mail!', 'success');
      setLoading(false);
      // navigate('/login'); // Opcional: navegar de volta
    } catch (error) {
      showNotification('E-mail não encontrado.', 'error');
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar Senha">
      <Typography component="p" align="center" sx={{ mb: 2 }}>
        Digite seu e-mail para enviarmos um link de recuperação.
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
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
            Enviar Link
          </Button>
          {/* 2. Adicionar um feedback de loading moderno */}
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
    </AuthLayout>
  );
};

export default RecuperarSenha;