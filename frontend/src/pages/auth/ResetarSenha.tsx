// Importa React, hooks e componentes de UI.
import React, { useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import { TextField, Button, Box, Typography, CircularProgress, Link } from '@mui/material';

/**
 * @component ResetarSenha
 * @description Página que permite ao usuário definir uma nova senha.
 * Esta página é acessada a partir de um link com um token de redefinição
 * enviado por e-mail (fluxo não totalmente implementado no front-end, mas o backend suporta).
 * Atualmente, o fluxo principal é via código de recuperação.
 */
const ResetarSenha: React.FC = () => {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useParams<{ token: string }>(); // Obtém o token da URL.
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Função para lidar com a submissão do formulário.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      showNotification('As senhas não coincidem.', 'error');
      return;
    }
    setLoading(true);
    try {
      // Envia o token e a nova senha para a API.
      await api.post('/auth/resetar-senha', { token, novaSenha: senha });
      showNotification('Senha redefinida com sucesso! Você já pode fazer login.', 'success');
      navigate('/login');
    } catch (error) {
      showNotification('Token inválido ou expirado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Redefinir Senha">
      <Typography component="p" align="center" sx={{ mb: 2 }}>
        Digite sua nova senha.
      </Typography>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <TextField
          margin="normal"
          required
          fullWidth
          name="senha"
          label="Nova Senha"
          type="password"
          id="senha"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmarSenha"
          label="Confirmar Nova Senha"
          type="password"
          id="confirmarSenha"
          autoComplete="new-password"
          value={confirmarSenha}
          onChange={(e) => setConfirmarSenha(e.target.value)}
          disabled={loading}
        />
        
        <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
          <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }} disabled={loading}>
            Redefinir Senha
          </Button>
          {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
        </Box>

        <Typography variant="body2" align="center">
          <Link component={RouterLink} to="/login" variant="body2">
            Voltar para o Login
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default ResetarSenha;