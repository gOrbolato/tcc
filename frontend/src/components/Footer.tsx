// src/components/Footer.tsx
import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    // 1. Usar <Box component="footer">
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        p: 6, // padding
      }}
    >
      <Container maxWidth="lg">
        {/* 2. Layout responsivo usando CSS Grid via Box */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 4 }}>
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              RateMyCourse
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plataforma para avaliação de disciplinas e professores.
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Links Rápidos
            </Typography>
            <Link
              component={RouterLink}
              to="/dashboard"
              display="block"
              variant="body2"
              color="text.secondary"
            >
              Meu Dashboard
            </Link>
            <Link
              component={RouterLink}
              to="/perfil"
              display="block"
              variant="body2"
              color="text.secondary"
            >
              Meu Perfil
            </Link>
          </Box>
          <Box>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Legal
            </Typography>
            <Link
              component={RouterLink}
              to="/termos-de-uso"
              display="block"
              variant="body2"
              color="text.secondary"
            >
              Termos de Uso
            </Link>
            <Link
              component={RouterLink}
              to="/politica-de-privacidade"
              display="block"
              variant="body2"
              color="text.secondary"
            >
              Política de Privacidade
            </Link>
          </Box>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          sx={{ pt: 5 }}
        >
          © {new Date().getFullYear()} RateMyCourse. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;