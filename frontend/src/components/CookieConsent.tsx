// Importa o React e hooks, além de componentes do Material-UI.
import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, Button } from '@mui/material';

/**
 * @component CookieConsent
 * @description Um banner de consentimento de cookies que aparece na parte inferior da tela
 * se o usuário ainda não tiver aceitado os cookies. Utiliza o `localStorage` para
 * persistir a decisão do usuário.
 */
const CookieConsent: React.FC = () => {
  // Estado para controlar a visibilidade do banner.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Verifica no localStorage se o consentimento de cookies já foi dado.
    const consent = localStorage.getItem('cookie_consent');
    // Se não houver consentimento registrado, abre o banner.
    if (!consent) {
      setOpen(true);
    }
  }, []);

  // Função para lidar com a aceitação dos cookies.
  const handleAccept = () => {
    // Salva a decisão do usuário no localStorage.
    localStorage.setItem('cookie_consent', 'true');
    // Fecha o banner.
    setOpen(false);
  };

  return (
    // O Snackbar é um componente do Material-UI para exibir mensagens temporárias.
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} // Posiciona o banner na parte inferior central.
      sx={{ maxWidth: '600px' }}
    >
      {/* O Alert fornece um layout de mensagem com ícone e cores. */}
      <Alert
        severity="info" // Define o estilo do alerta como informativo.
        // A propriedade 'action' permite adicionar botões ou outros elementos ao alerta.
        action={
          <Button color="inherit" size="small" onClick={handleAccept}>
            Entendi e Aceito
          </Button>
        }
        sx={{ width: '100%' }} // Garante que o alerta preencha todo o Snackbar.
      >
        Nós usamos cookies para melhorar sua experiência. Ao continuar a navegar,
        você concorda com nossa Política de Cookies.
      </Alert>
    </Snackbar>
  );
};

export default CookieConsent;