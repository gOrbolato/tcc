import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

// 1. Importar componentes de layout e formulário
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Box,
  CircularProgress,
  Divider,
} from '@mui/material';

const Perfil: React.FC = () => {
  const { user, setUser } = useAuth();
  const { showNotification } = useNotification();

  // 2. States separados para os dados do perfil e mudança de senha
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  
  const [senhaAntiga, setSenhaAntiga] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // 3. Carregar dados do usuário no state
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email ?? '');
      setRa(user.ra || ''); // Assumindo que RA pode ser opcional
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const response = await api.put('/user/profile', { nome, email, ra });
      setUser(response.data.user); // Atualiza o usuário no AuthContext
      showNotification('Perfil atualizado com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro ao atualizar perfil.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novaSenha !== confirmarNovaSenha) {
      showNotification('As novas senhas não coincidem.', 'error');
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put('/user/change-password', { senhaAntiga, novaSenha });
      showNotification('Senha alterada com sucesso!', 'success');
      // Limpar campos de senha
      setSenhaAntiga('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
    } catch (error) {
      showNotification('Erro ao alterar senha. Verifique sua senha antiga.', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!user) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Meu Perfil
      </Typography>
      
      {/* 4. Usar <Card> para os dados do perfil */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Informações Pessoais" />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handleProfileSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Nome Completo"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loadingProfile}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loadingProfile}
              />
              <TextField
                fullWidth
                label="RA (Registro Acadêmico)"
                value={ra}
                onChange={(e) => setRa(e.target.value)}
                disabled={loadingProfile}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loadingProfile}
                fullWidth
              >
                Salvar Informações
              </Button>
              {loadingProfile && <CircularProgress size={24} sx={spinnerSx} />}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 5. Usar outro <Card> para a mudança de senha */}
      <Card>
        <CardHeader title="Alterar Senha" />
        <Divider />
        <CardContent>
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Senha Antiga"
              type="password"
              value={senhaAntiga}
              onChange={(e) => setSenhaAntiga(e.target.value)}
              disabled={loadingPassword}
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Nova Senha"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                disabled={loadingPassword}
                required
              />
              <TextField
                fullWidth
                label="Confirmar Nova Senha"
                type="password"
                value={confirmarNovaSenha}
                onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                disabled={loadingPassword}
                required
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={loadingPassword}
                fullWidth
              >
                Alterar Senha
              </Button>
              {loadingPassword && <CircularProgress size={24} sx={spinnerSx} />}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

// 6. (Opcional) Estilo para o spinner do botão
const spinnerSx = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  marginTop: '-12px',
  marginLeft: '-12px',
};

export default Perfil;