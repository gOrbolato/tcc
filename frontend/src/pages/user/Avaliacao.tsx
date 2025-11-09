import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Question from '../../components/Question';
import { LinearProgress } from '@mui/material';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Box,
  Paper,
  Divider,
} from '@mui/material';

// Tipos para os dados (Exemplo)
interface Questao {
  id: number;
  texto: string;
  tipo: 'ESCOLHA_UNICA' | 'TEXTO_LIVRE';
  opcoes?: string[];
}

interface AvaliacaoInfo {
  professor: string;
  questoes: Questao[];
  instituicao_id?: number | null;
  curso_id?: number | null;
}

const Avaliacao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [avaliacaoInfo, setAvaliacaoInfo] = useState<AvaliacaoInfo | null>(null);
  // respostas will store per-question { score?: number, comment?: string }
  const [respostas, setRespostas] = useState<{ [key: number]: { score?: number | null; comment?: string } }>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAvaliacao = async () => {
      try {
        let response;
        if (id) {
          response = await api.get(`/evaluations/${id}`);
        } else {
          // novo: buscar template de avaliação
          response = await api.get('/evaluations/template');
        }
        setAvaliacaoInfo(response.data);
        // Inicializar respostas
        const respostasIniciais: { [key: number]: { score?: number | null; comment?: string } } = {};
        response.data.questoes.forEach((q: Questao) => {
          respostasIniciais[q.id] = { score: null, comment: '' };
        });
        setRespostas(respostasIniciais);
      } catch (error) {
        showNotification('Erro ao carregar avaliação', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAvaliacao();
  // showNotification may change identity between renders; running this effect only
  // when `id` changes prevents repeated fetches that could exhaust browser resources.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleScoreChange = (questaoId: number, score: number) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: {
        ...(prev[questaoId] || {}),
        score,
      }
    }));
  };

  const handleCommentChange = (questaoId: number, comment: string) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: {
        ...(prev[questaoId] || {}),
        comment,
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se todas as perguntas foram respondidas com nota
    const todasRespondidas = avaliacaoInfo?.questoes.every(q => respostas[q.id] && typeof respostas[q.id].score === 'number');
    if (!todasRespondidas) {
      showNotification('Por favor, responda todas as perguntas com uma nota.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Formatar dados para o backend
      // Build payload with nota_<key> and comentario_<key>
      const payload: any = {
        instituicao_id: avaliacaoInfo?.instituicao_id || null,
        curso_id: avaliacaoInfo?.curso_id || null,
      };
      if (id) payload.evaluationId = Number(id);
      Object.entries(respostas).forEach(([questaoId, answer]) => {
        const key = String(questaoId);
        payload[`nota_${key}`] = answer.score ?? null;
        payload[`comentario_${key}`] = answer.comment ?? null;
      });

      await api.post('/evaluations', payload);
      showNotification('Avaliação enviada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showNotification('Erro ao enviar avaliação', 'error');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  // compute completion percent
  const total = avaliacaoInfo?.questoes.length || 0;
  const answered = Object.values(respostas).filter(r => {
    if (!r) return false;
    const hasScore = typeof r.score === 'number';
    const hasComment = typeof r.comment === 'string' && r.comment.trim().length > 0;
    return hasScore || hasComment;
  }).length;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  // partition questions into institution vs course based on template ids (101-107 -> institution)
  const institutionQuestions = avaliacaoInfo?.questoes.filter(q => q.id >= 101 && q.id <= 107) || [];
  const courseQuestions = avaliacaoInfo?.questoes.filter(q => q.id >= 108) || [];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        {'Nova avaliação'}
      </Typography>

      {/* Important notice card */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Aviso Importante</Typography>
        <Box sx={{ width: 56, height: 4, bgcolor: '#6a4cff', borderRadius: 2, mt: 1, mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          Após o envio, sua avaliação <strong>não poderá ser editada.</strong> Você só poderá enviar uma nova avaliação daqui a 60 dias. Responda com atenção e honestidade.
        </Typography>
      </Paper>

      {/* Main card with sections */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        {/* Progress bar and percent */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Typography sx={{ minWidth: 60, textAlign: 'right' }}>{percent}%</Typography>
        </Box>

        {/* Institution section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Avaliação da Instituição</Typography>
          <Box sx={{ width: 56, height: 4, bgcolor: '#6a4cff', borderRadius: 2, mt: 1, mb: 2 }} />
          {institutionQuestions.map((questao) => (
            <Question
              key={questao.id}
              question={questao}
              score={respostas[questao.id]?.score ?? null}
              comment={respostas[questao.id]?.comment ?? ''}
              onScoreChange={(score) => handleScoreChange(questao.id, score)}
              onCommentChange={(c) => handleCommentChange(questao.id, c)}
              isSubmitting={isSubmitting}
            />
          ))}
        </Box>

        {/* Course section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Avaliação do Curso</Typography>
          <Box sx={{ width: 56, height: 4, bgcolor: '#6a4cff', borderRadius: 2, mt: 1, mb: 2 }} />
          {courseQuestions.map((questao) => (
            <Question
              key={questao.id}
              question={questao}
              score={respostas[questao.id]?.score ?? null}
              comment={respostas[questao.id]?.comment ?? ''}
              onScoreChange={(score) => handleScoreChange(questao.id, score)}
              onCommentChange={(c) => handleCommentChange(questao.id, c)}
              isSubmitting={isSubmitting}
            />
          ))}
        </Box>

        {/* Submit button */}
        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            onClick={(e) => handleSubmit(e as any)}
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            size="large"
            sx={{ py: 1.8, textTransform: 'none', borderRadius: 1 }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
          {isSubmitting && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                marginTop: '-28px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Avaliacao;