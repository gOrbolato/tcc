import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Avaliacao {
  id: number;
  criado_em: string;
  media_final: number;
  instituicao_nome?: string;
  curso_nome?: string;
}

interface EvaluationStatus {
  canEvaluate: boolean;
  daysRemaining: number;
  lastEvaluationDate: string | null;
}

const Dashboard: React.FC = () => {
  const [completedEvaluations, setCompletedEvaluations] = useState<Avaliacao[]>([]);
  const [evaluationStatus, setEvaluationStatus] = useState<EvaluationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isAdmin) {
      navigate('/admin/dashboard');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [evaluationsResponse, statusResponse] = await Promise.all([
          api.get('/my-evaluations'),
          api.get('/evaluations/user/status'),
        ]);

        const sortedEvaluations = (evaluationsResponse.data || []).sort(
          (a: Avaliacao, b: Avaliacao) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
        );
        setCompletedEvaluations(sortedEvaluations);
        setEvaluationStatus(statusResponse.data);
      } catch (error) {
        showNotification('Erro ao buscar dados do dashboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user, showNotification, navigate]);

  const renderEvaluationCard = (evaluation: Avaliacao) => {
  const inst = evaluation.instituicao_nome || (user as any)?.instituicao_nome;
  const curso = evaluation.curso_nome || (user as any)?.curso_nome;
    let title = '';
    if (inst && curso) title = `${inst} — ${curso}`;
    else if (inst) title = inst;
    else if (curso) title = curso;
    else title = 'Avaliação';

    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h5" component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                {Number(evaluation.media_final).toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                / 5.00
              </Typography>
            </Box>
            <Button variant="contained" size="medium" component={RouterLink} to={`/avaliacao/detalhes/${evaluation.id}`} sx={{ textTransform: 'none', ml: 2, px: 2 }}>
              Ver Detalhes
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Minhas Avaliações
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        {evaluationStatus?.canEvaluate ? (
          <Button variant="contained" color="primary" component={RouterLink} to="/nova-avaliacao" sx={{ textTransform: 'none' }} startIcon={<AddIcon />}>
            Nova Avaliação
          </Button>
        ) : (
          <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'grey.200', borderRadius: 1, width: '100%', maxWidth: 400 }}>
            <Typography variant="body2" color="text.secondary">
              Última avaliação em: {evaluationStatus?.lastEvaluationDate ? new Date(evaluationStatus.lastEvaluationDate).toLocaleDateString() : ''}
            </Typography>
            <Typography variant="h6" component="p" sx={{ mt: 1 }}>
              Próxima avaliação em: {evaluationStatus?.daysRemaining} dias
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {completedEvaluations.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
          {completedEvaluations.map((evalu) => (
            <Box key={evalu.id} sx={{ width: '100%', maxWidth: 900 }}>
              {renderEvaluationCard(evalu)}
            </Box>
          ))}
        </Box>
      ) : (
        <Card sx={{ width: '80%', margin: 'auto', p: 3, boxShadow: 3 }}>
          <CardContent>
            <Typography align="center">Você ainda não concluiu nenhuma avaliação.</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;