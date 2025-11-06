import React from 'react';
import { Paper, Box, Typography } from '@mui/material';

// URL da imagem que você usava no Auth.css
const imageUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  return (
  <Box component="main" sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '45% 1fr' } }}>
      {/* Left image panel - hidden on xs */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url(${imageUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundColor: (theme: any) =>
            theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(44, 62, 80, 0.7)',
          },
        }}
      />

      {/* Right form panel */}
      <Box component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
            {title}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;