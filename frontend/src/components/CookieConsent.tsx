// src/components/CookieConsent.tsx
import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';

const CookieConsent: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 1. Verificar se o consentimento já foi dado
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setOpen(false);
  };

  return (
    // 2. Usar o componente Snackbar
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ maxWidth: '600px' }} // Ajuste a largura conforme necessário
    >
      {/* 3. Usar o <Alert> dentro dele para um visual mais bonito */}
      <Alert
        severity="info"
        // 4. Adicionar o botão de "Aceitar" como uma ação
        action={
          <Button color="inherit" size="small" onClick={handleAccept}>
            Entendi e Aceito
          </Button>
        }
        sx={{ width: '100%' }} // Garantir que o Alert ocupe todo o espaço
      >
        Nós usamos cookies para melhorar sua experiência. Ao continuar a navegar,
        você concorda com nossa Política de Cookies.
      </Alert>
    </Snackbar>
  );
};

export default CookieConsent;