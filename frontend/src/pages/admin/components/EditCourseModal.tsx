// Importa React, hooks, componentes do Material-UI e a API.
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, DialogContentText } from '@mui/material';
import api from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';
// Importa o tipo `Course`.
import type { Course } from '../../../types/course';

// Interface para as propriedades do modal.
interface EditCourseModalProps {
  course: Course | null; // O objeto do curso a ser editado.
  open: boolean; // Controla a visibilidade do modal.
  onClose: () => void; // Função para fechar o modal.
  onCourseUpdated: (updatedCourse: Course) => void; // Callback para quando o curso é atualizado.
}

/**
 * @component EditCourseModal
 * @description Um modal para editar o nome de um curso existente.
 * Inclui um diálogo de confirmação antes de salvar as alterações.
 */
const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, open, onClose, onCourseUpdated }) => {
  const [nome, setNome] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false); // Estado para o modal de confirmação.
  const { showNotification } = useNotification();

  // Efeito para preencher o campo de nome quando um curso é selecionado.
  useEffect(() => {
    if (course) {
      setNome(course.nome);
    }
  }, [course]);

  // Função para lidar com a atualização do curso.
  const handleUpdateCourse = async () => {
    if (!course) return;
    try {
      const payload = { nome };
      const response = await api.put(`/entities/courses/${course.id}`, payload);
      onCourseUpdated(response.data.course); // Chama o callback com os dados atualizados.
      showNotification('Curso atualizado com sucesso.', 'success');
      setConfirmOpen(false);
      onClose(); // Fecha o modal principal.
    } catch (error) {
      console.error('Erro ao atualizar curso', error);
      showNotification('Erro ao atualizar curso.', 'error');
    }
  };

  return (
    <>
      {/* Modal principal de edição */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { p: 2, borderRadius: 2, minWidth: 600 } }}>
        <DialogTitle>Editar Curso</DialogTitle>
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

      {/* Modal de confirmação */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmação</DialogTitle>
        <DialogContent>
          <DialogContentText>Tem certeza que deseja salvar as alterações neste curso?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateCourse}>Confirmar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditCourseModal;
