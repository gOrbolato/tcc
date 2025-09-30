import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';

const App: React.FC = () => {
  const location = useLocation();

  // A condição agora verifica se a rota atual é a Home ("/")
  const shouldShowHeaderFooter = location.pathname === '/';

  return (
    <>
      {shouldShowHeaderFooter && <Header />}
      <main>
        <AppRoutes />
      </main>
      {shouldShowHeaderFooter && <Footer />}
      <CookieConsent />
    </>
  );
};

export default App;