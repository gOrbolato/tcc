import React from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import './assets/styles/App.css';

// Componente para controlar o layout
const AppLayout: React.FC = () => {
  const location = useLocation();
  // Mostra Header/Footer apenas na Home
  const showHeaderFooter = location.pathname === '/';

  return (
    <div className="app-container">
      {showHeaderFooter && <Header />}
      <main className="main-content">
        <AppRoutes />
      </main>
      {showHeaderFooter && <Footer />}
      <CookieConsent />
    </div>
  );
}

// Componente principal que provê os contextos
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;