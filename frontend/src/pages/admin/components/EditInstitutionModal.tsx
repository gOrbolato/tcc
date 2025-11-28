// Importa React, hooks, componentes do Material-UI e a API.
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, DialogContentText } from '@mui/material';
import api from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';

// Interface para a estrutura do objeto Instituição.
interface Institution {
  id: number;
  nome: string;
}

// Interface para as propriedades do modal.
interface EditInstitutionModalProps {
  institution: Institution | null; // O objeto da instituição a ser editada.
  open: boolean; // Controla a visibilidade do modal.
  onClose: () => void; // Função para fechar o modal.
  onInstitutionUpdated: (updatedInstitution: Institution) => void; // Callback executado após a atualização.
}

/**
 * @component EditInstitutionModal
 * @description Um modal para editar o nome de uma instituição.
 * Apresenta um campo de texto para o novo nome e um diálogo de confirmação.
 */
const EditInstitutionModal: React.FC<EditInstitutionModalProps> = ({ institution, open, onClose, onInstitutionUpdated }) => {
  const [nome, setNome] = useState('');
  const { showNotification } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false); // Estado para o modal de confirmação.

  // Preenche o campo 'nome' quando o modal é aberto com uma instituição.
  useEffect(() => {
    if (institution) {
      setNome(institution.nome);
    }
  }, [institution]);

  // Função para enviar a atualização para a API.
  const handleUpdateInstitution = async () => {
    if (!institution) return;
    try {
      const payload = { nome };
      const response = await api.put(`/entities/institutions/${institution.id}`, payload);
      onInstitutionUpdated(response.data.institution); // Executa o callback para atualizar a UI.
      showNotification('Instituição atualizada com sucesso.', 'success');
      setConfirmOpen(false);
      onClose(); // Fecha o modal principal.
    } catch (error) {
      console.error('Erro ao atualizar instituição', error);
      showNotification('Erro ao atualizar instituição.', 'error');
    }
  };

  return (
    <>
      {/* Modal de Edição */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { p: 2, borderRadius: 2, minWidth: 600 } }}>
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
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={() => setConfirmOpen(true)}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Confirmação */}
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
