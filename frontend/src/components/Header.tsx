// Importa React, hooks e componentes do Material-UI.
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar,
  ListItemIcon, Divider, useScrollTrigger, Slide,
} from '@mui/material';

// Importa ícones do Material-UI.
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';

/**
 * @component HideOnScroll
 * @description Um High-Order Component (HOC) que esconde seu conteúdo filho
 * (neste caso, o Header) quando o usuário rola a página para baixo.
 */
function HideOnScroll(props: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
}

/**
 * @component Header
 * @description O cabeçalho principal da aplicação. Exibe o título, links de navegação
 * e opções de usuário (login/registro ou perfil/sair) de forma responsiva.
 */
const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Estados para controlar a abertura dos menus (mobile e perfil).
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  // Funções para abrir e fechar os menus.
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setMobileMoreAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  // Função para deslogar o usuário e redirecioná-lo para a home.
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  // Navega para o dashboard apropriado (admin ou usuário) se estiver logado.
  const handleNavigation = () => {
    navigate(isAuthenticated && user ? (user.isAdmin ? '/admin/dashboard' : '/dashboard') : '/');
  };

  // Itens do menu para usuários não autenticados.
  const authMenuItems = [
    <MenuItem key="login" component={RouterLink} to="/login" onClick={handleMobileMenuClose}>Login</MenuItem>,
    <MenuItem key="register" component={RouterLink} to="/registro" onClick={handleMobileMenuClose}>Registrar</MenuItem>,
  ];

  // Itens do menu para usuários autenticados.
  const userMenuItems = [
    <MenuItem key="profile" component={RouterLink} to="/perfil" onClick={handleProfileMenuClose}>
      <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
      Perfil
    </MenuItem>,
    <Divider key="divider" />,
    <MenuItem key="logout" onClick={handleLogout}>
      <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
      Sair
    </MenuItem>,
  ];

  // Renderiza o menu para a visualização em desktop.
  const renderDesktopMenu = (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
      {isAuthenticated && user ? (
        <>
          <Typography sx={{ mr: 2 }}>Olá, {user.nome.split(' ')[0]}</Typography>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <IconButton size="large" edge="end" onClick={handleProfileMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user.nome[0].toUpperCase()}
              </Avatar>
            </IconButton>
          </motion.div>
        </>
      ) : (
        <>
          <Button variant="outlined" color="inherit" component={RouterLink} to="/login">Login</Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="contained" color="primary" component={RouterLink} to="/registro">
              Registrar
            </Button>
          </motion.div>
        </>
      )}
    </Box>
  );

  // Renderiza o ícone do menu para a visualização em mobile.
  const renderMobileMenu = (
    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
      <IconButton size="large" edge="end" color="inherit" onClick={handleMobileMenuOpen}>
        <MenuIcon />
      </IconButton>
    </Box>
  );

  return (
    <HideOnScroll>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', cursor: 'pointer' }} onClick={handleNavigation}>
            Avaliação Educacional
          </Typography>

          <Box sx={{ flexGrow: 1 }} /> {/* Espaçador flexível */}

          {renderDesktopMenu}
          {renderMobileMenu}
        </Toolbar>

        {/* Menu de Perfil (ancorado no ícone do avatar) */}
        <Menu anchorEl={profileAnchorEl} open={Boolean(profileAnchorEl)} onClose={handleProfileMenuClose} sx={{ mt: 1 }}>
          {userMenuItems}
        </Menu>

        {/* Menu Mobile (ancorado no ícone de menu) */}
        <Menu anchorEl={mobileMoreAnchorEl} open={Boolean(mobileMoreAnchorEl)} onClose={handleMobileMenuClose}>
          {isAuthenticated ? userMenuItems : authMenuItems}
        </Menu>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header;