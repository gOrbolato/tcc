import React, { useState, useEffect } from 'react';
import '../assets/styles/App.css';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setVisible(false);
    // Aqui você pode adicionar a lógica para obter a localização do usuário
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="cookie-consent">
      <p>
        Utilizamos cookies para melhorar sua experiência. Ao continuar, você
        concorda com nossa política de cookies e nos permite acessar sua
        localização.
      </p>
      <button onClick={handleAccept}>Aceitar</button>
    </div>
  );
};

export default CookieConsent;