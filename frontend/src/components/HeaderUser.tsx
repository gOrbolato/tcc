import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  Divider,
  useScrollTrigger,
  Slide,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';

// HOC para esconder o header ao rolar
function HideOnScroll(props: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
}

const HeaderUser: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

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
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            Painel
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ mr: 2, display: { xs: 'none', md: 'block' } }}>
                Olá, {user.nome.split(' ')[0]}
              </Typography>
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