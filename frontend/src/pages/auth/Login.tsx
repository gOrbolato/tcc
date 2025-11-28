// Importa React, hooks e componentes de contexto e UI.
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import { motion } from 'framer-motion';

// Importa componentes do Material-UI para o formulário.
import { TextField, Button, FormControlLabel, Checkbox, Link, Box, Typography } from '@mui/material';

/**
 * @component Login
 * @description A página de login da aplicação. Permite que usuários e administradores
 * acessem suas contas.
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Função para lidar com a submissão do formulário de login.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(email, senha);
      showNotification('Login realizado com sucesso!', 'success');
      // Redireciona com base no papel do usuário (admin ou não).
      navigate(userData.isAdmin ? '/admin/dashboard' : '/dashboard');
    } catch (error: any) {
      // Trata o erro específico de conta trancada.
      if (error?.response?.status === 403 && error?.response?.data?.message === 'ACCOUNT_LOCKED') {
        showNotification('Sua conta está trancada. Por favor, reative seu acesso.', 'warning');
        navigate('/validar-codigo');
      } else {
        showNotification('E-mail ou senha inválidos.', 'error');
      }
    }
  };

  return (
    // Utiliza o layout padrão para páginas de autenticação.
    <AuthLayout title="Login">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        {/* Campo de E-mail */}
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
        />
        {/* Campo de Senha */}
        <TextField
          margin="normal"
          required
          fullWidth
          name="senha"
          label="Senha"
          type="password"
          id="senha"
          autoComplete="current-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />
        
        {/* Opções de "Lembrar-me" e "Esqueci minha senha". */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
          <FormControlLabel control={<Checkbox value="remember" color="primary" />} label="Lembrar-me" />
          <Link component={RouterLink} to="/recuperar-senha" variant="body2">
            Esqueci minha senha
          </Link>
        </Box>
        
        {/* Botão de Login com animação. */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
            Entrar
          </Button>
        </motion.div>
        
        {/* Link para a página de registro. */}
        <Typography variant="body2" align="center">
          Não tem uma conta?{' '}
          <Link component={RouterLink} to="/registro" variant="body2">
            Registre-se
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Login;