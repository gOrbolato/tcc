import React from 'react';
import AppRoutes from './routes';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieConsent from './components/CookieConsent';
import { AuthProvider } from './contexts/AuthContext'; // Importe o provider
import './assets/styles/App.css';

function App() {
  return (
    <AuthProvider> {/* Envolva a aplicação com o provider */}
      <div className="app-container">
        <Header />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </AuthProvider>
  );
}

export default App;