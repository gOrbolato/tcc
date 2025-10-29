// src/pages/admin/VisualizarAvaliacoes.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress,
  Box,
  IconButton,
  Tooltip,
  Chip, // 1. Usar Chip para Status
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';

// 2. Definir tipos
interface Avaliacao {
  id: number;
  disciplinaNome: string;
  professorNome: string;
  userName: string;
  status: 'PENDENTE' | 'CONCLUIDA' | 'REPROVADA';
  createdAt: string;
}

const VisualizarAvaliacoes: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const response = await api.get('/admin/evaluations'); // Ajuste a rota da API
        setAvaliacoes(response.data);
      } catch (error) {
        showNotification('Erro ao carregar avaliações', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAvaliacoes();
  }, [showNotification]);

  const handleViewDetails = (id: number) => {
    // 3. Navegar para a página de detalhes (que também refatoraremos)
    navigate(`/avaliacao/detalhes/${id}`);
  };

  const getStatusChip = (status: Avaliacao['status']) => {
    let color: "warning" | "success" | "error" | "default" = "default";
    let icon = <PendingIcon />;

    if (status === 'CONCLUIDA') {
      color = 'success';
      icon = <CheckCircleIcon />;
    } else if (status === 'PENDENTE') {
      color = 'warning';
      icon = <PendingIcon />;
    } else if (status === 'REPROVADA') {
      color = 'error';
      icon = <CancelIcon />; // Supondo que exista esse ícone
    }
    
    return <Chip label={status} color={color} icon={icon} size="small" />;
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
        Gerenciar Avaliações
      </Typography>

      {/* 4. Usar a Tabela do MUI */}
      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de avaliações">
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Disciplina</TableCell>
              <TableCell>Professor</TableCell>
              <TableCell>Usuário</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {avaliacoes.map((ava) => (
              <TableRow key={ava.id}>
                <TableCell component="th" scope="row">{ava.disciplinaNome}</TableCell>
                <TableCell>{ava.professorNome}</TableCell>
                <TableCell>{ava.userName}</TableCell>
                <TableCell>{new Date(ava.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{getStatusChip(ava.status)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="Ver Detalhes">
                    <IconButton onClick={() => handleViewDetails(ava.id)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  {/* Outros botões como Aprovar/Reprovar podem ir aqui */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default VisualizarAvaliacoes;