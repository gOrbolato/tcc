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

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setMobileMoreAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setProfileAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setProfileAnchorEl(null);

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  const handleNavigation = () => {
    if (isAuthenticated && user) {
      navigate(user.isAdmin ? '/admin/dashboard' : '/dashboard');
    } else {
      navigate('/');
    }
  };

  const authMenuItems = [
    <MenuItem key="login" component={RouterLink} to="/login" onClick={handleMobileMenuClose}>Login</MenuItem>,
    <MenuItem key="register" component={RouterLink} to="/registro" onClick={handleMobileMenuClose}>Registrar</MenuItem>,
  ];

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
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={handleNavigation}
          >
            Avaliação Educacional
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {renderDesktopMenu}
          {renderMobileMenu}
        </Toolbar>

        {/* Menu de Perfil */}
        <Menu
          anchorEl={profileAnchorEl}
          open={Boolean(profileAnchorEl)}
          onClose={handleProfileMenuClose}
          sx={{ mt: 1 }}
        >
          {userMenuItems}
        </Menu>

        {/* Menu Mobile */}
        <Menu
          anchorEl={mobileMoreAnchorEl}
          open={Boolean(mobileMoreAnchorEl)}
          onClose={handleMobileMenuClose}
        >
          {isAuthenticated ? userMenuItems : authMenuItems}
        </Menu>
      </AppBar>
    </HideOnScroll>
  );
};

export default Header;