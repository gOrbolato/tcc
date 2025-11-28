// Importa React, hooks e componentes do Material-UI.
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

import {
  AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem, Avatar,
  ListItemIcon, Divider, useScrollTrigger, Slide,
} from '@mui/material';

// Importa ícones do Material-UI.
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';

/**
 * @component HideOnScroll
 * @description HOC para esconder o cabeçalho ao rolar a página para baixo.
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
 * @component HeaderUser
 * @description Cabeçalho para a área logada do usuário (não-admin).
 * Exibe uma saudação, o título do painel e um menu de perfil com opções de "Perfil" e "Sair".
 */
const HeaderUser: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Estado para controlar a abertura do menu de perfil.
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  // Funções para abrir e fechar o menu de perfil.
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  // Função para deslogar o usuário.
  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  // Itens do menu de perfil.
  const profileMenuItems = [
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

  return (
    <HideOnScroll>
      <AppBar position="sticky">
        <Toolbar>
          {/* Título do painel, que também é um link para o dashboard. */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            Painel
          </Typography>

          <Box sx={{ flexGrow: 1 }} /> {/* Espaçador */}

          {/* Exibe a saudação e o ícone de perfil se o usuário estiver logado. */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {/* Saudação visível apenas em telas maiores. */}
              <Typography sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>
                Olá, {user.nome.split(' ')[0]}
              </Typography>
              {/* Ícone de perfil com animação. */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <IconButton size="large" edge="end" onClick={handleProfileMenuOpen} color="inherit">
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {user.nome[0].toUpperCase()}
                  </Avatar>
                </IconButton>
              </motion.div>
            </Box>
          )}
        </Toolbar>

        {/* Menu de perfil que abre ao clicar no ícone do avatar. */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileMenuClose}
          sx={{ mt: 1 }}
        >
          {profileMenuItems}
        </Menu>
      </AppBar>
    </HideOnScroll>
  );
};

export default HeaderUser;