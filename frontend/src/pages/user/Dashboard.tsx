import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

// 1. Importar componentes de Layout e Cards
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';

// 2. (Opcional) Definir tipos para os dados
interface Avaliacao {
  id: number;
  disciplina: string;
  professor: string;
  status: 'PENDENTE' | 'CONCLUIDA';
}

const Dashboard: React.FC = () => {
  const [availableEvaluations, setAvailableEvaluations] = useState<Avaliacao[]>([]);
  const [completedEvaluations, setCompletedEvaluations] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        // Usar Promise.all para buscar ambas as listas em paralelo
        const [availableRes, completedRes] = await Promise.all([
          api.get('/evaluations/user/available'),
          api.get('/evaluations/user/completed'),
        ]);
        setAvailableEvaluations(availableRes.data);
        setCompletedEvaluations(completedRes.data);
      } catch (error) {
        showNotification('Erro ao buscar avaliações', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [showNotification]);

  // 3. Função para renderizar um card de avaliação
  const renderEvaluationCard = (evaluation: Avaliacao, isCompleted: boolean) => (
    <Box key={evaluation.id} sx={{ width: '100%' }}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <CardContent>
          <Typography variant="h6" component="h3" gutterBottom>
            {evaluation.disciplina}
          </Typography>
          <Typography color="text.secondary">
            Professor: {evaluation.professor}
          </Typography>
        </CardContent>
        <CardActions>
          <Button
            size="small"
            component={RouterLink}
            to={
              isCompleted
                ? `/avaliacao/detalhes/${evaluation.id}`
                : `/avaliacao/${evaluation.id}`
            }
          >
            {isCompleted ? 'Ver Detalhes' : 'Iniciar Avaliação'}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    // 4. Usar <Container> para centralizar e limitar a largura do conteúdo
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bem-vindo(a), {user?.nome.split(' ')[0]}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Aqui estão suas avaliações pendentes e concluídas.
      </Typography>

      {/* Seção de Avaliações Disponíveis */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Avaliações Disponíveis
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {/* 5. Layout responsivo de cards usando CSS grid */}
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
          {availableEvaluations.length > 0 ? (
            availableEvaluations.map((evalu) => renderEvaluationCard(evalu, false))
          ) : (
            <Box>
              <Typography>Você não possui avaliações pendentes.</Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Seção de Avaliações Concluídas */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Avaliações Concluídas
        </Typography>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' } }}>
          {completedEvaluations.length > 0 ? (
            completedEvaluations.map((evalu) => renderEvaluationCard(evalu, true))
          ) : (
            <Box>
              <Typography>Você ainda não concluiu nenhuma avaliação.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;