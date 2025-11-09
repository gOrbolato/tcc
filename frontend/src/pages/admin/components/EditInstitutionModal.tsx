import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, DialogContentText } from '@mui/material';
import api from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';

interface Institution {
  id: number;
  nome: string;
}

interface EditInstitutionModalProps {
  institution: Institution | null;
  open: boolean;
  onClose: () => void;
  onInstitutionUpdated: (updatedInstitution: Institution) => void;
}

const EditInstitutionModal: React.FC<EditInstitutionModalProps> = ({ institution, open, onClose, onInstitutionUpdated }) => {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (institution) {
      setNome(institution.nome);
    }
  }, [institution]);

  const { showNotification } = useNotification();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleUpdateInstitution = async () => {
    if (!institution) return;
    try {
      const payload = { nome };
      const response = await api.put(`/entities/institutions/${institution.id}`, payload);
      onInstitutionUpdated(response.data.institution);
      showNotification('Instituição atualizada com sucesso.', 'success');
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar instituição', error);
      showNotification('Erro ao atualizar instituição.', 'error');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { p: 2, borderRadius: 2, minWidth: 600 } }}
      >
      <DialogTitle>Editar Instituição</DialogTitle>
        <DialogContent dividers sx={{ py: 3 }}>
        <TextField
          autoFocus
          margin="normal"
          label="Nome"
          type="text"
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          InputProps={{ sx: { fontSize: 16 } }}
        />
      </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={() => setConfirmOpen(true)}>Salvar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja salvar as alterações nesta instituição?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateInstitution}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditInstitutionModal;
