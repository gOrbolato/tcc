// Importa o React e componentes do Material-UI.
import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
// Importa o hook useNavigate para navegação programática.
import { useNavigate } from 'react-router-dom';

// URL de uma imagem de fundo para o painel de autenticação.
const imageUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop';

// Interface para as propriedades do componente AuthLayout.
interface AuthLayoutProps {
  title: string; // O título a ser exibido no formulário (ex: "Login", "Cadastro").
  children: React.ReactNode; // O conteúdo do formulário (os campos de input, botões, etc.).
}

/**
 * @component AuthLayout
 * @description Um layout reutilizável para as páginas de autenticação (Login, Cadastro, etc.).
 * Consiste em um painel com uma imagem à esquerda (visível em telas maiores) e o formulário à direita.
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    // O container principal utiliza Grid para criar o layout de duas colunas.
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '45% 1fr' } }}>
      {/* Painel da imagem à esquerda - escondido em telas pequenas (xs). */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          backgroundImage: `url(${imageUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          // Adiciona uma sobreposição escura sobre a imagem para melhorar a legibilidade do texto.
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
        {/* Título da aplicação sobreposto à imagem. */}
        <Typography
          variant="h5"
          onClick={() => navigate('/')} // Navega para a página inicial ao clicar.
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

      {/* Painel do formulário à direita. */}
      <Box component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: 'rgba(15,23,32,0.9)' }}>
        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', color: 'rgba(15,23,32,0.9)' }}>
          {/* Título do formulário (ex: "Login"). */}
          <Typography component="h1" variant="h4" sx={{ mb: 2, color: 'rgba(15,23,32,0.9)' }}>
            {title}
          </Typography>
          {/* Renderiza o conteúdo do formulário passado como 'children'. */}
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;