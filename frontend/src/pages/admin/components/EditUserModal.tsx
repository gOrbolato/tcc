import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete } from '@mui/material';
import api from '../../../services/api';

import type { User } from '../../../types/user';

interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, open, onClose, onUserUpdated }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setRa(user.ra || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/institutions');
        setInstitutions(response.data);
      } catch (error) {
        console.error('Erro ao carregar instituições', error);
      }
    };
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      const fetchCourses = async () => {
        try {
          const response = await api.get(`/courses?institutionId=${selectedInstitution.id}`);
          setCourses(response.data);
        } catch (error) {
          console.error('Erro ao carregar cursos', error);
        }
      };
      fetchCourses();
    } else {
      setCourses([]);
    }
  }, [selectedInstitution]);

  const handleUpdateUser = async () => {
    if (!user) return;
    try {
      const payload = {
        nome,
        email,
        ra,
        instituicao_id: selectedInstitution?.id,
        curso_id: selectedCourse?.id,
      };
      const response = await api.patch(`/admin/users/${user.id}`, payload);
      onUserUpdated(response.data.user);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar usuário', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Usuário</DialogTitle>
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
        <TextField
          margin="dense"
          label="E-mail"
          type="email"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          margin="dense"
          label="RA"
          type="text"
          fullWidth
          value={ra}
          onChange={(e) => setRa(e.target.value)}
        />
        <Autocomplete
          options={institutions}
          getOptionLabel={(option) => option.nome}
          value={selectedInstitution}
          onChange={(_event, newValue) => {
            setSelectedInstitution(newValue);
            setSelectedCourse(null);
          }}
          renderInput={(params) => <TextField {...params} label="Instituição" />}
        />
        <Autocomplete
          options={courses}
          getOptionLabel={(option) => option.nome}
          value={selectedCourse}
          onChange={(_event, newValue) => {
            setSelectedCourse(newValue);
          }}
          renderInput={(params) => <TextField {...params} label="Curso" />}
          disabled={!selectedInstitution}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleUpdateUser}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;
