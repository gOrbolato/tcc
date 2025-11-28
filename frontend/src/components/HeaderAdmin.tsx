// Importa React, hooks de navegação e autenticação, e componentes do Material-UI.
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

/**
 * @component HideOnScroll
 * @description Um High-Order Component (HOC) que esconde o conteúdo filho ao rolar a página.
 * @param {{ children: React.ReactElement }} props - As propriedades do componente, incluindo o conteúdo a ser envolvido.
 * @returns {React.ReactElement}
 */
function HideOnScroll(props: { children: React.ReactElement }): React.ReactElement {
  // `useScrollTrigger` é um hook do Material-UI que detecta a rolagem da página.
  const trigger = useScrollTrigger();
  return (
    // `Slide` é um componente de animação que desliza o conteúdo para dentro ou fora da tela.
    <Slide appear={false} direction="down" in={!trigger}>
      {props.children}
    </Slide>
  );
}

/**
 * @component HeaderAdmin
 * @description O cabeçalho específico para a área administrativa da aplicação.
 * Exibe o título do painel e um botão de "Sair".
 */
const HeaderAdmin: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Função para deslogar o administrador e redirecioná-lo para a página inicial.
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    // Envolve o AppBar com o HOC para que ele se esconda ao rolar.
    <HideOnScroll>
      <AppBar position="sticky">
        <Toolbar>
          {/* Título do painel administrativo, que também serve como link para o dashboard. */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', cursor: 'pointer' }}
            onClick={() => navigate('/admin/dashboard')}
          >
            Painel Administrativo
          </Typography>

          {/* Um Box flexível que empurra o botão de sair para a direita. */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Botão para executar a função de logout. */}
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            Sair
          </Button>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
};

export default HeaderAdmin;