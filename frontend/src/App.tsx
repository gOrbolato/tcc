import React from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

import { adminTheme, alunoTheme } from './theme'; // Import themes
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import FirstVisitManager from './components/FirstVisitManager'; // Importar o novo componente
import AppRoutes from './routes';

import { useAuth } from './contexts/AuthContext';

const App: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth(); // Usar o hook de autenticação

  // Lógica do tema baseada no papel do usuário
  const theme = user?.isAdmin ? adminTheme : alunoTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Normaliza estilos e aplica a cor de fundo do tema */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {location.pathname === '/' && <Header />}

        <Box component="main" sx={{ flexGrow: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <AppRoutes location={location} />
            </motion.div>
          </AnimatePresence>
        </Box>
        
        {location.pathname === '/' && <Footer />}
        <CookieConsent />
        <FirstVisitManager /> {/* Adicionar o novo componente aqui */}
      </Box>
    </ThemeProvider>
  );
};

export default App;