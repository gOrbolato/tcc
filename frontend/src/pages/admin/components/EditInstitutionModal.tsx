import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import api from '../../../services/api';

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

  const handleUpdateInstitution = async () => {
    if (!institution) return;
    try {
      const payload = { nome };
      const response = await api.put(`/entities/institutions/${institution.id}`, payload);
      onInstitutionUpdated(response.data.institution);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar instituição', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Instituição</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Nome"
          type="text"
          fullWidth
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleUpdateInstitution}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInstitutionModal;
