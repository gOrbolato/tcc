import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    // Aqui você pode adicionar a lógica para obter a localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        console.log('Latitude:', position.coords.latitude);
        console.log('Longitude:', position.coords.longitude);
      });
    }
    setShow(false);
  };

  if (!show) {
    return null;
  }

  return (
    <div>
      <p>
        Este site utiliza cookies para melhorar a sua experiência. Ao continuar a navegar, você concorda com a nossa utilização de cookies e com a nossa política de privacidade, incluindo a coleta de sua localização.
      </p>
      <button onClick={handleAccept}>Aceitar</button>
    </div>
  );
};

export default CookieConsent;
