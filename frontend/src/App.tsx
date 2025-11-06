// src/App.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import AppRoutes from './routes'; // Importa o componente de rotas

// 1. Importar Framer Motion e Box do MUI
import { AnimatePresence, motion } from 'framer-motion';
import { Box } from '@mui/material';

const App: React.FC = () => {
  const location = useLocation(); // 2. Pegar a localização para a animação

  return (
    // 3. Usar Box para layout "sticky footer"
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* 4. Área principal que cresce */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* 5. AnimatePresence para transições de página */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname} // Chave única para a rota
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
    </Box>
  );
};

export default App;