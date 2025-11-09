import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, DialogContentText } from '@mui/material';
import api from '../../../services/api';
import { useNotification } from '../../../contexts/NotificationContext';

import type { Course } from '../../../types/course';

interface EditCourseModalProps {
  course: Course | null;
  open: boolean;
  onClose: () => void;
  onCourseUpdated: (updatedCourse: Course) => void;
}

const EditCourseModal: React.FC<EditCourseModalProps> = ({ course, open, onClose, onCourseUpdated }) => {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (course) {
      setNome(course.nome);
    }
  }, [course]);

  const { showNotification } = useNotification();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleUpdateCourse = async () => {
    if (!course) return;
    try {
      const payload = { nome };
      const response = await api.put(`/entities/courses/${course.id}`, payload);
      onCourseUpdated(response.data.course);
      showNotification('Curso atualizado com sucesso.', 'success');
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar curso', error);
      showNotification('Erro ao atualizar curso.', 'error');
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
            Tem certeza que deseja salvar as alterações neste curso?
          </DialogContentText>
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
