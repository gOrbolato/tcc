import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// URL da imagem que você usava no Auth.css
const imageUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop';

interface AuthLayoutProps {
  title: string;
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '45% 1fr' } }}>
      {/* Left image panel - hidden on xs */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url(${imageUrl})`,
          backgroundRepeat: 'no-repeat',
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
            backgroundColor: 'rgba(44, 62, 80, 0.55)',
          },
        }}
      >
        <Typography
          variant="h5"
          onClick={() => navigate('/')}
          sx={{
            position: 'absolute',
            top: '35%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontWeight: 700,
            cursor: 'pointer',
            zIndex: 2,
            textAlign: 'center',
            px: 2,
            py: 1,
            borderRadius: 1,
            background: 'rgba(0,0,0,0.18)'
          }}
        >
          Avaliação Educacional
        </Typography>
      </Box>

      {/* Right form panel */}
      <Box component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: 'rgba(15,23,32,0.9)' }}>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', color: 'rgba(15,23,32,0.9)' }}>
          <Typography component="h1" variant="h4" sx={{ mb: 2, color: 'rgba(15,23,32,0.9)' }}>
            {title}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;