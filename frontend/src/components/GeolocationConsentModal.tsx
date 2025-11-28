// Importa React e componentes do Material-UI para criar a caixa de diálogo.
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

// Interface para definir as propriedades que o componente `GeolocationConsentModal` espera receber.
interface GeolocationConsentModalProps {
  open: boolean; // Controla se o modal está visível ou não.
  onClose: () => void; // Função chamada quando o usuário tenta fechar o modal (ex: clicando fora).
  onAllow: () => void; // Função chamada quando o usuário clica em "Permitir".
  onDeny: () => void; // Função chamada quando o usuário clica em "Negar".
}

/**
 * @component GeolocationConsentModal
 * @description Um modal que solicita ao usuário permissão para acessar sua geolocalização.
 * Ele explica por que a localização é necessária e oferece as opções de permitir ou negar.
 */
const GeolocationConsentModal: React.FC<GeolocationConsentModalProps> = ({ open, onClose, onAllow, onDeny }) => {
  return (
    // Componente `Dialog` do Material-UI que serve como base para o modal.
    <Dialog open={open} onClose={onClose}>
      {/* Título do modal. */}
      <DialogTitle>Usar sua localização?</DialogTitle>
      {/* Conteúdo principal do modal. */}
      <DialogContent>
        {/* Texto explicativo sobre o motivo da solicitação de permissão. */}
        <DialogContentText>
          Para fornecer resultados de busca mais relevantes e encontrar instituições perto de você, precisamos da sua permissão para acessar sua localização.
          <br /><br />
          Sua localização só será usada para esta finalidade e não será compartilhada.
        </DialogContentText>
      </DialogContent>
      {/* Área de ações do modal, onde ficam os botões. */}
      <DialogActions>
        {/* Botão para negar a permissão. */}
        <Button onClick={onDeny} color="secondary">Negar</Button>
        {/* Botão para permitir a permissão, com destaque visual. */}
        <Button onClick={onAllow} variant="contained" autoFocus>
          Permitir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeolocationConsentModal;