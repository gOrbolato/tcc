import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import api from '../../../services/api';

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

  const handleUpdateCourse = async () => {
    if (!course) return;
    try {
      const payload = { nome };
      const response = await api.put(`/entities/courses/${course.id}`, payload);
      onCourseUpdated(response.data.course);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar curso', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Curso</DialogTitle>
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
        <Button onClick={handleUpdateCourse}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCourseModal;
