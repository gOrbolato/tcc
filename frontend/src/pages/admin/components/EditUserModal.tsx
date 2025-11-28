// Importa React, hooks e componentes do Material-UI.
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Autocomplete } from '@mui/material';
// Importa a instância da API e tipos.
import api from '../../../services/api';
import type { User } from '../../../types/user';

// Interface para as propriedades do modal.
interface EditUserModalProps {
  user: User | null; // O objeto do usuário a ser editado.
  open: boolean; // Controla a visibilidade do modal.
  onClose: () => void; // Função para fechar o modal.
  onUserUpdated: (updatedUser: User) => void; // Callback executado após a atualização do usuário.
}

/**
 * @component EditUserModal
 * @description Um modal que permite a um administrador editar os dados de um usuário,
 * incluindo nome, e-mail, RA, instituição e curso.
 */
const EditUserModal: React.FC<EditUserModalProps> = ({ user, open, onClose, onUserUpdated }) => {
  // Estados para os campos do formulário.
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [ra, setRa] = useState('');
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  // Efeito para preencher o formulário com os dados do usuário quando o modal é aberto.
  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setEmail(user.email);
      setRa(user.ra || '');
      // Pré-seleciona a instituição e o curso se existirem no objeto do usuário.
      // (Esta parte pode ser melhorada para buscar os objetos completos da instituição/curso)
    }
  }, [user]);

  // Efeito para buscar a lista de todas as instituições ao montar o componente.
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

  // Efeito para buscar os cursos de uma instituição sempre que ela for selecionada.
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
      setCourses([]); // Limpa a lista de cursos se nenhuma instituição estiver selecionada.
    }
  }, [selectedInstitution]);

  // Função para lidar com o envio da atualização para a API.
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
      onUserUpdated(response.data.user); // Executa o callback com os dados atualizados.
      onClose(); // Fecha o modal.
    } catch (error) {
      console.error('Erro ao atualizar usuário', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar Usuário</DialogTitle>
      <DialogContent>
        <TextField autoFocus margin="dense" label="Nome" type="text" fullWidth value={nome} onChange={(e) => setNome(e.target.value)} />
        <TextField margin="dense" label="E-mail" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField margin="dense" label="RA" type="text" fullWidth value={ra} onChange={(e) => setRa(e.target.value)} />
        <Autocomplete
          options={institutions}
          getOptionLabel={(option) => option.nome}
          value={selectedInstitution}
          onChange={(_event, newValue) => {
            setSelectedInstitution(newValue);
            setSelectedCourse(null); // Reseta o curso ao mudar a instituição.
          }}
          renderInput={(params) => <TextField {...params} label="Instituição" />}
        />
        <Autocomplete
          options={courses}
          getOptionLabel={(option) => option.nome}
          value={selectedCourse}
          onChange={(_event, newValue) => setSelectedCourse(newValue)}
          renderInput={(params) => <TextField {...params} label="Curso" />}
          disabled={!selectedInstitution} // Desabilita se nenhuma instituição for selecionada.
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

