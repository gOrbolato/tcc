import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

// 1. Importar componentes de Tabela
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';

// 2. Importar Ícones para ações
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// 3. Definir o tipo de dado do Usuário
interface User {
  id: number;
  nome: string;
  email: string;
  ra: string | null;
  isAdmin: boolean;
  isActive: boolean;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (userId: number) => {
    // Lógica para abrir um modal de edição (MUI tem o <Modal> e <Dialog>)
    showNotification(`Editar usuário ${userId} (implementar modal)`, 'info');
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        showNotification('Usuário deletado com sucesso', 'success');
        fetchUsers(); // Recarrega a lista
      } catch (error) {
        showNotification('Erro ao deletar usuário', 'error');
      }
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`, { isActive: !user.isActive });
      showNotification(`Usuário ${user.isActive ? 'desativado' : 'ativado'} com sucesso`, 'success');
      fetchUsers(); // Recarrega a lista
    } catch (error) {
      showNotification('Erro ao alterar status do usuário', 'error');
    }
  };


  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Usuários
      </Typography>
      
      {/* 4. Usar <TableContainer> e <Paper> para a tabela */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
          {/* 5. Cabeçalho da Tabela */}
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>E-mail</TableCell>
              <TableCell>RA</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Ativo</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          {/* 6. Corpo da Tabela */}
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {user.nome}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.ra || 'N/A'}</TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell>
                  {user.isActive ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </TableCell>
                <TableCell align="right">
                  {/* 7. Botões de Ação com Ícones */}
                  <Tooltip title={user.isActive ? "Desativar Usuário" : "Ativar Usuário"}>
                    <IconButton onClick={() => handleToggleActive(user)} color={user.isActive ? "error" : "success"}>
                      {user.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar Usuário">
                    <IconButton onClick={() => handleEditUser(user.id)} color="primary">
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Deletar Usuário">
                    <IconButton onClick={() => handleDeleteUser(user.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminUserManagement;