import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Container, Typography, TextField, Button, Box, Paper, CircularProgress } from '@mui/material';

const ValidarCodigoDesbloqueio: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/validate-unlock-code', { cpf, code });
      showNotification(response.data.message, 'success');
      // Redireciona para o login para que o usuário possa logar na conta agora reativada
      navigate('/login');
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Erro ao validar o código.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={6} sx={{ p: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Reativar Conta
        </Typography>
        <Typography align="center" sx={{ mb: 3 }}>
          Insira seu CPF e o código de verificação que você recebeu por e-mail para reativar sua conta.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="cpf"
            label="CPF"
            name="cpf"
            autoComplete="cpf"
            autoFocus
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="code"
            label="Código de Verificação"
            type="text"
            id="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !cpf || !code}
            >
              Reativar Conta
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
        </Box>
      </Paper>
    </Container>
  );
};

export default ValidarCodigoDesbloqueio;
