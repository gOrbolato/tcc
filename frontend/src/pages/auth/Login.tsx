import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import { motion } from 'framer-motion';

// 1. Importar componentes do MUI
import {
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
} from '@mui/material';

// 2. Importar o Link do React Router para o MUI
import { Link as RouterLink } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login(email, senha);
      showNotification('Login realizado com sucesso!', 'success');
      if (userData.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      // MODIFICADO: Checa o erro específico de conta trancada
      if (error?.response?.status === 403 && error?.response?.data?.message === 'ACCOUNT_LOCKED') {
        showNotification('Sua conta está trancada. Por favor, reative seu acesso.', 'warning');
        navigate('/validar-codigo');
      } else {
        showNotification('E-mail ou senha inválidos.', 'error');
      }
    }
  };

  return (
    <AuthLayout title="Login">
      {/* 3. Usar Box ao invés de <form> simples para ter acesso ao 'sx' prop */}
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        {/* 4. Substituir <div class="form-group">, <label> e <input> 
             por um único <TextField> 
        */}
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
        
        {/* 5. Substituir as opções de formulário */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1 }}>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Lembrar-me"
          />
          <Link component={RouterLink} to="/recuperar-senha" variant="body2">
            Esqueci minha senha
          </Link>
        </Box>
        
        {/* 6. Substituir <button> por <Button> */}
        <motion.div
          whileHover={{ scale: 1.02 }} // Efeito sutil ao passar o mouse
          whileTap={{ scale: 0.98 }}   // Efeito ao clicar
        >
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
          >
            Entrar
          </Button>
        </motion.div>
        
        {/* 7. Substituir o redirecionamento */}
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