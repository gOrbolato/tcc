import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 1. Importar componentes de AppBar, Ícones e Menu
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
} from '@mui/material';

// 2. Importar Ícones
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // 3. State para controlar os menus (móvel e perfil)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate('/');
  };

  // 4. Links para o menu de perfil
  const profileMenuItems = [
    <MenuItem
      key="profile"
      component={RouterLink}
      to="/perfil"
      onClick={handleProfileMenuClose}
    >
      <ListItemIcon>
        <AccountCircle fontSize="small" />
      </ListItemIcon>
      Perfil
    </MenuItem>,
    <MenuItem
      key="dashboard"
      component={RouterLink}
      to={user?.isAdmin ? '/admin/dashboard' : '/dashboard'}
      onClick={handleProfileMenuClose}
    >
      <ListItemIcon>
        {user?.isAdmin ? <AdminPanelSettingsIcon fontSize="small" /> : <DashboardIcon fontSize="small" />}
      </ListItemIcon>
      {user?.isAdmin ? 'Painel Admin' : 'Dashboard'}
    </MenuItem>,
    <Divider key="divider" />,
    <MenuItem key="logout" onClick={handleLogout}>
      <ListItemIcon>
        <Logout fontSize="small" />
      </ListItemIcon>
      Sair
    </MenuItem>,
  ];

  // 5. Links para o menu de desktop (escondido no mobile)
  const renderDesktopMenu = (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
      {isAuthenticated && user ? (
        <>
          <Typography sx={{ mr: 2 }}>Olá, {user.nome.split(' ')[0]}</Typography>
          <IconButton
            size="large"
            edge="end"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            {/* Usar Avatar com a inicial do usuário */}
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
              {user.nome[0].toUpperCase()}
            </Avatar>
          </IconButton>
        </>
      ) : (
        <>
          <Button color="inherit" component={RouterLink} to="/login">
            Login
          </Button>
          <Button color="inherit" component={RouterLink} to="/registro">
            Registro
          </Button>
        </>
      )}
    </Box>
  );

  // 6. Links para o menu móvel (escondido no desktop)
  const renderMobileMenu = (
    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
      <IconButton
        size="large"
        edge="end"
        color="inherit"
        onClick={handleMobileMenuOpen}
      >
        <MenuIcon />
      </IconButton>
    </Box>
  );

  return (
    // 7. Usar AppBar no lugar de <header>
    <AppBar position="static">
      <Toolbar>
        {/* Título/Logo à esquerda */}
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1, // Empurra todo o resto para a direita
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Avaliação Educacional
        </Typography>

        {/* Menus da direita */}
        {renderDesktopMenu}
        {renderMobileMenu}
      </Toolbar>

      {/* 8. Declarar os Menus que abrem */}
      <Menu
        anchorEl={profileAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
      >
        {profileMenuItems}
      </Menu>

      <Menu
        anchorEl={mobileMoreAnchorEl}
        open={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      >
        {isAuthenticated && user ? (
          profileMenuItems // Reutiliza os mesmos links do perfil no mobile
        ) : (
          [
            <MenuItem key="login" component={RouterLink} to="/login" onClick={handleMobileMenuClose}>
              Login
            </MenuItem>,
            <MenuItem key="register" component={RouterLink} to="/registro" onClick={handleMobileMenuClose}>
              Registro
            </MenuItem>,
          ]
        )}
      </Menu>
    </AppBar>
  );
};

export default Header;