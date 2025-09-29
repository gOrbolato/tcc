import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';

const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShow(true);
    }
  }, []);

  const handleAccept = async () => {
    localStorage.setItem('cookie-consent', 'true');
    setShow(false);

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Usuário não autenticado. Consentimento não será enviado ao backend.', 'info');
      return;
    }

    let consentimento_localizacao = false;
    if (navigator.geolocation) {
      consentimento_localizacao = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Latitude:', position.coords.latitude);
          console.log('Longitude:', position.coords.longitude);
          // Aqui você pode enviar a localização para o backend se necessário
        },
        (error) => {
          showNotification('Erro ao obter localização: ' + error.message, 'error');
          consentimento_localizacao = false; // Se houver erro, não considera consentido
        }
      );
    }

    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          consentimento_cookies: true,
          consentimento_localizacao: consentimento_localizacao,
        }),
      });
    } catch (error) {
      showNotification('Erro ao enviar consentimento para o backend.', 'error');
    }
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
