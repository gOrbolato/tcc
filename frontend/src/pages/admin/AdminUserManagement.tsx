import React, { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

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
  Autocomplete,
  TextField,
  Toolbar,
  alpha,
  Chip,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton, // Adicionado IconButton
} from '@mui/material';

import ReportFilters, { type SearchOptions } from './reports/components/ReportFilters';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ClearIcon from '@mui/icons-material/Clear'; // Adicionado ClearIcon

import type { User } from '../../types/user';

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { showNotification } = useNotification();

  const fetchUsers = useCallback(async (filters: SearchOptions) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await api.get('/admin/users', { params: filters });
      setUsers(response.data || []);
    } catch (error) {
      showNotification('Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const handleSearch = (options: SearchOptions) => {
    if (!options.institutionId && !options.courseId) {
      showNotification('Selecione ao menos uma instituição ou curso para buscar.', 'info');
      return;
    }
    fetchUsers(options);
  };

  const handleClear = () => {
    setUsers([]);
    setHasSearched(false);
  };

  const [desbloqueios, setDesbloqueios] = useState<any[]>([]);
  const [loadingDesbloqueios, setLoadingDesbloqueios] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const fetchDesbloqueios = useCallback(async (date: string) => {
    if (!date) {
      setDesbloqueios([]);
      return;
    }
    setLoadingDesbloqueios(true);
    try {
      const res = await api.get('/admin/desbloqueios', { params: { date } });
      setDesbloqueios(res.data || []);
    } catch (err) {
      showNotification('Erro ao carregar pedidos de desbloqueio', 'error');
    } finally {
      setLoadingDesbloqueios(false);
    }
  }, [showNotification]);

  const fetchPendingCount = useCallback(async () => {
    try {
      const res = await api.get('/admin/desbloqueios/count');
      setPendingCount(res.data.count);
    } catch (err) {
      console.error('Erro ao buscar contagem de pendências.');
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  useEffect(() => {
    fetchDesbloqueios(dateFilter);
  }, [fetchDesbloqueios, dateFilter]);

  const handleApprove = async (id: number) => {
    try {
      await api.post(`/admin/desbloqueios/${id}/approve`);
      showNotification('Aprovado', 'success');
      fetchDesbloqueios(dateFilter);
      fetchPendingCount();
    } catch (err) {
      showNotification('Erro ao aprovar', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.post(`/admin/desbloqueios/${id}/reject`);
      showNotification('Rejeitado', 'info');
      fetchDesbloqueios(dateFilter);
      fetchPendingCount();
    } catch (err) {
      showNotification('Erro ao rejeitar', 'error');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Usuários
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>Filtros de Usuário</Typography>
        <ReportFilters onSearch={handleSearch} onClear={handleClear} loading={loading} />
      </Paper>

      <Paper elevation={3} sx={{ width: '100%', mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
            <TableHead>
              <TableRow>
                <TableCell>ID Anônimo</TableCell>
                <TableCell>Instituição</TableCell>
                <TableCell>Curso</TableCell>
                <TableCell align="center">Ativo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{user.anonymized_id || 'N/A'}</TableCell>
                    <TableCell>{user.instituicao_nome ?? '—'}</TableCell>
                    <TableCell>{user.curso_nome ?? '—'}</TableCell>
                    <TableCell align="center">
                      {user.isActive ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {hasSearched ? 'Nenhum usuário encontrado para os filtros selecionados.' : 'Utilize os filtros para buscar usuários.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={3} sx={{ width: '100%', mt: 4 }}>
        <Toolbar
          sx={{
            pl: { sm: 2 },
            pr: { xs: 1, sm: 1 },
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
          }}
        >
          <Box sx={{ flex: '1 1 100%', display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="div">
              Pedidos de Desbloqueio
            </Typography>
            {pendingCount > 0 && (
              <Chip label={pendingCount} color="error" size="small" />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              label="Filtrar por Data"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <IconButton onClick={() => setDateFilter('')} size="small">
              <ClearIcon />
            </IconButton>
          </Box>
        </Toolbar>
        <TableContainer>
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
              {loadingDesbloqueios ? (
                <TableRow><TableCell colSpan={4} align="center"><CircularProgress /></TableCell></TableRow>
              ) : desbloqueios.length > 0 ? (
                desbloqueios.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{d.anonymized_id || `u:${d.usuario_id}`}</TableCell>
                    <TableCell>{d.motivo || '—'}</TableCell>
                    <TableCell>{new Date(d.criado_em).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button variant="contained" color="success" size="small" onClick={() => handleApprove(d.id)}>
                          Aprovar
                        </Button>
                        <Button variant="outlined" color="error" size="small" onClick={() => handleReject(d.id)}>
                          Rejeitar
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    {dateFilter ? 'Nenhuma solicitação encontrada para esta data.' : 'Selecione uma data para ver as solicitações.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminUserManagement;