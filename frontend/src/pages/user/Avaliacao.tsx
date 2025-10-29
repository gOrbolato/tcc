import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Question from '../../components/Question';
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
  disciplina: string;
  professor: string;
  questoes: Questao[];
}

const Avaliacao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [avaliacaoInfo, setAvaliacaoInfo] = useState<AvaliacaoInfo | null>(null);
  const [respostas, setRespostas] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchAvaliacao = async () => {
      try {
        const response = await api.get(`/evaluations/${id}`);
        setAvaliacaoInfo(response.data);
        // Inicializar respostas
        const respostasIniciais: { [key: number]: string } = {};
        response.data.questoes.forEach((q: Questao) => {
          respostasIniciais[q.id] = '';
        });
        setRespostas(respostasIniciais);
      } catch (error) {
        showNotification('Erro ao carregar avaliação', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchAvaliacao();
  }, [id, showNotification]);

  const handleRespostaChange = (questaoId: number, resposta: string) => {
    setRespostas((prev) => ({
      ...prev,
      [questaoId]: resposta,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se todas as perguntas foram respondidas
    const todasRespondidas = avaliacaoInfo?.questoes.every(q => respostas[q.id] && respostas[q.id] !== '');
    if (!todasRespondidas) {
      showNotification('Por favor, responda todas as perguntas.', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Formatar dados para o backend
      const dadosEnvio = {
        evaluationId: Number(id),
        respostas: Object.entries(respostas).map(([questaoId, resposta]) => ({
          questaoId: Number(questaoId),
          // Backend espera 'textoResposta' ou 'opcaoResposta'
          // Ajuste essa lógica conforme seu backend
          ...(avaliacaoInfo?.questoes.find(q => q.id === Number(questaoId))?.tipo === 'TEXTO_LIVRE'
            ? { textoResposta: resposta }
            : { opcaoResposta: Number(resposta) })
        })),
      };

      await api.post('/evaluations/submit', dadosEnvio);
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

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* 1. Usar Paper para criar um "card" para o formulário */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {avaliacaoInfo?.disciplina}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Professor(a): {avaliacaoInfo?.professor}
        </Typography>
        <Divider sx={{ mb: 4 }} />

        {/* 2. Usar Box como o <form> */}
        <Box component="form" onSubmit={handleSubmit}>
          {avaliacaoInfo?.questoes.map((questao) => (
            <Question
              key={questao.id}
              question={questao}
              resposta={respostas[questao.id] || ''}
              onChange={(resposta) => handleRespostaChange(questao.id, resposta)}
              isSubmitting={isSubmitting}
            />
          ))}
          
          {/* 3. Botão de envio com feedback de loading */}
          <Box sx={{ mt: 4, position: 'relative' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              size="large"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
            {isSubmitting && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Avaliacao;