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
  TextField,
  IconButton,
  Tooltip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';

// 2. Importar Ícones para ações
// Edit/Delete icons removed per UX: no add/edit from admin UI
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import EditUserModal from './components/EditUserModal';

// 3. Definir o tipo de dado do Usuário
import type { User } from '../../types/user';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToRemove, setUserToRemove] = useState<User | null>(null);

  const handleRemoveUser = async () => {
    if (!userToRemove) return;
    try {
      await api.delete(`/admin/users/${userToRemove.id}`);
      showNotification('Usuário removido com sucesso', 'success');
      setUsers(prev => prev.filter(u => u.id !== userToRemove.id));
      setUserToRemove(null);
    } catch (error) {
      showNotification('Erro ao remover usuário', 'error');
    }
  };
  const { showNotification } = useNotification();

  const fetchUsers = async (filters?: { institutionId?: number | undefined; courseId?: number | undefined; anonymizedId?: string | undefined; }) => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters?.institutionId) params.institutionId = filters.institutionId;
      if (filters?.courseId) params.courseId = filters.courseId;
      if (filters?.anonymizedId) params.anonymizedId = filters.anonymizedId;
      const response = await api.get('/admin/users', { params });
      setUsers(response.data || []);
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- Desbloqueios (pedidos de desbloqueio) ---
  const [desbloqueios, setDesbloqueios] = useState<any[]>([]);
  const [loadingDesbloqueios, setLoadingDesbloqueios] = useState(true);

  const fetchDesbloqueios = async () => {
    setLoadingDesbloqueios(true);
    try {
      const res = await api.get('/admin/desbloqueios');
      setDesbloqueios(res.data || []);
    } catch (err) {
      showNotification('Erro ao carregar pedidos de desbloqueio', 'error');
    } finally {
      setLoadingDesbloqueios(false);
    }
  };

  useEffect(() => {
    fetchDesbloqueios();
  }, []);

  // Edit/Delete operations removed from UI (no create/edit from admin pages)

  const handleToggleActive = async (user: User) => {
    try {
      await api.patch(`/admin/users/${user.id}`, { is_active: !user.isActive });
      showNotification(`Usuário ${user.isActive ? 'desativado' : 'ativado'} com sucesso`, 'success');
      fetchUsers(); // Recarrega a lista
    } catch (error) {
      showNotification('Erro ao alterar status do usuário', 'error');
    }
  };


  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
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
      <EditUserModal
        user={userToEdit}
        open={!!userToEdit}
        onClose={() => setUserToEdit(null)}
        onUserUpdated={handleUserUpdated}
      />
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Usuários
      </Typography>
      {/* Filtros removidos */}

      <TableContainer component={Paper} elevation={3} sx={{ p: 2, '& th, & td': { px: 2 } }}>
        <Table sx={{ minWidth: 650, tableLayout: 'auto' }} aria-label="tabela de usuários">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ pl: 3, width: 160 }}>ID Anônimo</TableCell>
              <TableCell sx={{ px: 2 }}>Instituição</TableCell>
              <TableCell sx={{ px: 2 }}>Curso</TableCell>
              <TableCell sx={{ px: 2, width: 110, textAlign: 'center' }}>Ativo</TableCell>
                                            <TableCell align="right" sx={{ pr: 3, width: 240 }}>Ações</TableCell>            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell sx={{ pl: 3, width: 320, fontFamily: 'monospace', wordBreak: 'break-all' }}>{user.anonymized_id || 'N/A'}</TableCell>
                <TableCell sx={{ px: 2 }}>{user.instituicao_nome || 'N/A'}</TableCell>
                <TableCell sx={{ px: 2 }}>{user.curso_nome || 'N/A'}</TableCell>
                <TableCell sx={{ px: 2, width: 110, textAlign: 'center' }}>
                  {user.isActive ? (
                    <CheckCircleIcon color="success" />
                  ) : (
                    <CancelIcon color="error" />
                  )}
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, width: 240 }}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <Button variant="outlined" size="small" color="primary" onClick={() => handleToggleActive(user)}>
                      {user.isActive ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button variant="outlined" size="small" color="primary" onClick={() => setUserToEdit(user)}>Editar</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => setUserToRemove(user)}>Remover</Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>Pedidos de Desbloqueio</Typography>
        {loadingDesbloqueios ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper} sx={{ mt: 2, p: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Anônimo</TableCell>
                  <TableCell>Motivo</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {desbloqueios.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{d.anonymized_id || `u:${d.usuario_id}`}</TableCell>
                    <TableCell>{d.motivo || '—'}</TableCell>
                    <TableCell>{new Date(d.criado_em).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button variant="contained" color="success" sx={{ mr: 1 }} onClick={async () => {
                          try {
                            await api.post(`/admin/desbloqueios/${d.id}/approve`);
                            showNotification('Aprovado', 'success');
                            setDesbloqueios(prev => prev.filter(item => item.id !== d.id)); // Remove o item aprovado
                            fetchUsers();
                          } catch (err) { showNotification('Erro ao aprovar', 'error'); }
                        }}>Aprovar</Button>
                        <Button variant="outlined" color="error" onClick={async () => {
                          try {
                            await api.post(`/admin/desbloqueios/${d.id}/reject`);
                            showNotification('Rejeitado', 'info');
                            setDesbloqueios(prev => prev.filter(item => item.id !== d.id)); // Remove o item rejeitado
                          } catch (err) { showNotification('Erro ao rejeitar', 'error'); }
                        }}>Rejeitar</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Dialog open={!!userToRemove} onClose={() => setUserToRemove(null)}>
        <DialogTitle>Confirmar Remoção</DialogTitle>
        <DialogContent>
          <Typography>Tem certeza que deseja remover o usuário {userToRemove?.nome}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserToRemove(null)}>Cancelar</Button>
          <Button onClick={handleRemoveUser} color="error">Remover</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUserManagement;