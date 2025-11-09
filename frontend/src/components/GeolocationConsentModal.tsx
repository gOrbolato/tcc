import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface GeolocationConsentModalProps {
  open: boolean;
  onClose: () => void;
  onAllow: () => void;
  onDeny: () => void;
}

const GeolocationConsentModal: React.FC<GeolocationConsentModalProps> = ({ open, onClose, onAllow, onDeny }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Usar sua localização?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Para fornecer resultados de busca mais relevantes e encontrar instituições perto de você, precisamos da sua permissão para acessar sua localização.
          <br /><br />
          Sua localização só será usada para esta finalidade e não será compartilhada.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDeny} color="secondary">Negar</Button>
        <Button onClick={onAllow} variant="contained" autoFocus>
          Permitir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeolocationConsentModal;