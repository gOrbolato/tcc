import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useScrollTrigger,
  Slide,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

// HOC para esconder o header ao rolar
function HideOnScroll(props: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
}

const HeaderAdmin: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HideOnScroll>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/admin/dashboard')}
          >
            Painel Administrativo
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default HeaderAdmin;