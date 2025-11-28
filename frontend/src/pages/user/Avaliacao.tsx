// Importa React, hooks e componentes de UI.
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Question from '../../components/Question';
import { useNotification } from '../../contexts/NotificationContext';
import { Container, Typography, Button, CircularProgress, Box, Paper, LinearProgress } from '@mui/material';

// Tipos para os dados da avaliação.
interface Questao { id: number; texto: string; tipo: 'ESCOLHA_UNICA' | 'TEXTO_LIVRE'; opcoes?: string[]; }
interface AvaliacaoInfo { professor: string; questoes: Questao[]; instituicao_id?: number | null; curso_id?: number | null; }

/**
 * @component Avaliacao
 * @description Página onde o usuário preenche o formulário de avaliação.
 * Busca o template de questões da API e envia as respostas do usuário.
 */
const Avaliacao: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // O 'id' seria para editar uma avaliação existente (não implementado).
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [avaliacaoInfo, setAvaliacaoInfo] = useState<AvaliacaoInfo | null>(null);
  const [respostas, setRespostas] = useState<{ [key: number]: { score?: number | null; comment?: string } }>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Busca o template da avaliação ao carregar a página.
  useEffect(() => {
    const fetchAvaliacao = async () => {
      try {
        // Se houver um ID, buscaria uma avaliação existente. Como não há, busca o template para uma nova.
        const response = await api.get(id ? `/evaluations/${id}` : '/evaluations/template');
        setAvaliacaoInfo(response.data);
        // Inicializa o estado das respostas com valores vazios para cada questão.
        const respostasIniciais: { [key: number]: {} } = {};
        response.data.questoes.forEach((q: Questao) => { respostasIniciais[q.id] = { score: null, comment: '' }; });
        setRespostas(respostasIniciais);
      } catch (error) {
        showNotification('Erro ao carregar o formulário de avaliação.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAvaliacao();
  }, [id, showNotification]);

  // Funções para atualizar o estado das respostas conforme o usuário interage.
  const handleScoreChange = (questaoId: number, score: number) => setRespostas(p => ({ ...p, [questaoId]: { ...p[questaoId], score } }));
  const handleCommentChange = (questaoId: number, comment: string) => setRespostas(p => ({ ...p, [questaoId]: { ...p[questaoId], comment } }));

  // Função para submeter o formulário.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validação: verifica se todas as perguntas têm uma nota.
    const todasRespondidas = avaliacaoInfo?.questoes.every(q => typeof respostas[q.id]?.score === 'number');
    if (!todasRespondidas) {
      showNotification('Por favor, responda todas as perguntas com uma nota.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Monta o payload para enviar à API.
      const payload: any = {
        instituicao_id: avaliacaoInfo?.instituicao_id,
        curso_id: avaliacaoInfo?.curso_id,
      };
      Object.entries(respostas).forEach(([questaoId, answer]) => {
        payload[`nota_${questaoId}`] = answer.score ?? null;
        payload[`comentario_${questaoId}`] = answer.comment ?? null;
      });

      await api.post('/evaluations', payload);
      showNotification('Avaliação enviada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showNotification('Erro ao enviar avaliação. Verifique se você já não avaliou nos últimos 60 dias.', 'error');
      setIsSubmitting(false);
    }
  };

  if (loading) return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container>;

  // Calcula a porcentagem de conclusão do formulário.
  const total = avaliacaoInfo?.questoes.length || 0;
  const answered = Object.values(respostas).filter(r => r && (typeof r.score === 'number' || (r.comment && r.comment.trim().length > 0))).length;
  const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

  // Separa as questões em "Instituição" e "Curso".
  const institutionQuestions = avaliacaoInfo?.questoes.filter(q => q.id >= 101 && q.id <= 107) || [];
  const courseQuestions = avaliacaoInfo?.questoes.filter(q => q.id >= 108) || [];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">Nova Avaliação</Typography>

      <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Aviso Importante</Typography>
        <Box sx={{ width: 56, height: 4, bgcolor: 'primary.main', borderRadius: 2, mt: 1, mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Após o envio, sua avaliação <strong>não poderá ser editada.</strong> Você só poderá enviar uma nova avaliação daqui a 60 dias. Responda com atenção e honestidade.</Typography>
      </Paper>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}><LinearProgress variant="determinate" value={percent} sx={{ height: 10, borderRadius: 5 }} /></Box>
          <Typography sx={{ minWidth: 60, textAlign: 'right' }}>{percent}%</Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Avaliação da Instituição</Typography>
          <Box sx={{ width: 56, height: 4, bgcolor: 'primary.main', borderRadius: 2, mt: 1, mb: 2 }} />
          {institutionQuestions.map((q) => <Question key={q.id} question={q} score={respostas[q.id]?.score} comment={respostas[q.id]?.comment} onScoreChange={(s) => handleScoreChange(q.id, s)} onCommentChange={(c) => handleCommentChange(q.id, c)} isSubmitting={isSubmitting} />)}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Avaliação do Curso</Typography>
          <Box sx={{ width: 56, height: 4, bgcolor: 'primary.main', borderRadius: 2, mt: 1, mb: 2 }} />
          {courseQuestions.map((q) => <Question key={q.id} question={q} score={respostas[q.id]?.score} comment={respostas[q.id]?.comment} onScoreChange={(s) => handleScoreChange(q.id, s)} onCommentChange={(c) => handleCommentChange(q.id, c)} isSubmitting={isSubmitting} />)}
        </Box>

        <Box sx={{ mt: 3 }}>
          <Button type="submit" onClick={handleSubmit} variant="contained" fullWidth disabled={isSubmitting} size="large" sx={{ py: 1.8 }}>
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
          {isSubmitting && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
        </Box>
      </Paper>
    </Container>
  );
};

export default Avaliacao;