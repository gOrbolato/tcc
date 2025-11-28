// Importa React, hooks, componentes de UI e Framer Motion.
import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Container, Typography, Card, CardContent, Button, CircularProgress, Box, Divider, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Interfaces para tipagem dos dados.
interface Avaliacao { id: number; criado_em: string; media_final: number; instituicao_nome?: string; curso_nome?: string; }
interface EvaluationStatus { canEvaluate: boolean; daysRemaining: number; lastEvaluationDate: string | null; }

/**
 * @component Dashboard
 * @description A página principal do usuário logado. Exibe o status da avaliação (se pode fazer uma nova),
 * um cartão com a média geral e uma lista de avaliações já completadas.
 */
const Dashboard: React.FC = () => {
  // Hooks de estado e contexto.
  const [completedEvaluations, setCompletedEvaluations] = useState<Avaliacao[]>([]);
  const [evaluationStatus, setEvaluationStatus] = useState<EvaluationStatus | null>(null);
  const [overallAverage, setOverallAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Efeito para buscar os dados do dashboard quando o usuário é carregado.
  useEffect(() => {
    // Redireciona para o dashboard de admin se o usuário for administrador.
    if (user?.isAdmin) {
      navigate('/admin/dashboard');
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Busca as avaliações completadas e o status de avaliação em paralelo.
        const [evaluationsResponse, statusResponse] = await Promise.all([
          api.get('/my-evaluations'),
          api.get('/evaluations/user/status'),
        ]);

        const sortedEvaluations = (evaluationsResponse.data || []).sort(
          (a: Avaliacao, b: Avaliacao) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
        );
        setCompletedEvaluations(sortedEvaluations);
        setEvaluationStatus(statusResponse.data);

        // Calcula a média geral das avaliações do usuário.
        if (sortedEvaluations.length > 0) {
          const totalSum = sortedEvaluations.reduce((sum: number, evalItem: Avaliacao) => sum + evalItem.media_final, 0);
          setOverallAverage(totalSum / sortedEvaluations.length);
        } else {
          setOverallAverage(null);
        }
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

  // Função para renderizar um card de avaliação individual.
  const renderEvaluationCard = (evaluation: Avaliacao) => {
    const title = `${evaluation.instituicao_nome || (user as any)?.instituicao_nome || 'Instituição'} — ${evaluation.curso_nome || (user as any)?.curso_nome || 'Curso'}`;
    return (
      <motion.div whileHover={{ y: -5 }} style={{ width: '100%' }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>{title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" component="span" color="primary" sx={{ fontWeight: 'bold' }}>{Number(evaluation.media_final).toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary"> / 5.00</Typography>
              </Box>
              <Button variant="outlined" component={RouterLink} to={`/avaliacao/detalhes/${evaluation.id}`}>Ver Detalhes</Button>
            </Box>
          </CardContent>
        </Paper>
      </motion.div>
    );
  };

  if (loading) return <Container sx={{ py: 8, textAlign: 'center' }}><CircularProgress /></Container>;

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, textAlign: 'center' }}>Minhas Avaliações</Typography>

        {/* Seção para iniciar uma nova avaliação ou mostrar o cooldown. */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          {evaluationStatus?.canEvaluate ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="contained" component={RouterLink} to="/nova-avaliacao" startIcon={<AddIcon />}>Realizar Nova Avaliação</Button>
            </motion.div>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Última avaliação em: {new Date(evaluationStatus!.lastEvaluationDate!).toLocaleDateString()}</Typography>
              <Typography variant="h6" component="p" sx={{ mt: 1, fontWeight: 600 }}>Próxima avaliação em {evaluationStatus?.daysRemaining} dias</Typography>
            </Paper>
          )}
        </Box>

        {/* Card com a média geral do usuário. */}
        {overallAverage !== null && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <Card sx={{ minWidth: 275, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h6">Média Geral de Suas Avaliações</Typography>
                <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{overallAverage.toFixed(2)}</Typography>
                <Typography variant="body2">/ 5.00</Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        <Divider sx={{ mb: 4 }} />

        {/* Lista de avaliações completadas ou mensagem de "nenhuma encontrada". */}
        {completedEvaluations.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
            {completedEvaluations.map((evalu) => <Box key={evalu.id} sx={{ width: '100%', maxWidth: 900 }}>{renderEvaluationCard(evalu)}</Box>)}
          </Box>
        ) : (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <AssignmentIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6">Nenhuma avaliação encontrada</Typography>
            <Typography color="text.secondary">Parece que você ainda não completou nenhuma avaliação.</Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;