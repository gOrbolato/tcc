// Importa o React e hooks necessários.
import React from 'react';
import { useLocation } from 'react-router-dom';
// Importa componentes e utilitários do Material-UI para estilização.
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
// Importa componentes do Framer Motion para animações de transição de página.
import { AnimatePresence, motion } from 'framer-motion';

// Importa os temas customizados da aplicação.
import { adminTheme, alunoTheme } from './theme';
// Importa componentes reutilizáveis da aplicação.
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import FirstVisitManager from './components/FirstVisitManager';
// Importa o componente que define as rotas da aplicação.
import AppRoutes from './routes';
// Importa o hook de autenticação para acessar o contexto do usuário.
import { useAuth } from './contexts/AuthContext';

/**
 * @component App
 * @description Componente principal da aplicação. É responsável por gerenciar o tema,
 * o layout geral, as animações de transição de página e a renderização das rotas.
 */
const App: React.FC = () => {
  // Hook para obter a localização atual (URL).
  const location = useLocation();
  // Hook para acessar os dados do usuário autenticado.
  const { user } = useAuth();

  // Seleciona o tema com base no papel do usuário (administrador ou aluno).
  const theme = user?.isAdmin ? adminTheme : alunoTheme;

  return (
    // Provedor de tema do Material-UI, que aplica o tema selecionado a todos os componentes filhos.
    <ThemeProvider theme={theme}>
      {/* Componente que normaliza os estilos CSS e aplica a cor de fundo do tema. */}
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Renderiza o cabeçalho apenas na página inicial. */}
        {location.pathname === '/' && <Header />}

        <Box component="main" sx={{ flexGrow: 1 }}>
          {/* Componente do Framer Motion para animar a entrada e saída de componentes. */}
          <AnimatePresence mode="wait">
            {/* Componente de animação que envolve as rotas. */}
            <motion.div
              key={location.pathname} // A chave garante que a animação seja acionada na mudança de rota.
              initial={{ opacity: 0, y: 20 }} // Estado inicial da animação.
              animate={{ opacity: 1, y: 0 }} // Estado final da animação.
              exit={{ opacity: 0, y: -20 }} // Estado de saída da animação.
              transition={{ duration: 0.2 }} // Duração da transição.
            >
              {/* Renderiza o componente de rotas. */}
              <AppRoutes location={location} />
            </motion.div>
          </AnimatePresence>
        </Box>
        
        {/* Renderiza o rodapé apenas na página inicial. */}
        {location.pathname === '/' && <Footer />}
        {/* Componente para gerenciar o consentimento de cookies. */}
        <CookieConsent />
        {/* Componente para gerenciar a primeira visita do usuário (ex: tour guiado). */}
        <FirstVisitManager />
      </Box>
    </ThemeProvider>
  );
};

export default App;