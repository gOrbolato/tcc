import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import {
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Box,
} from '@mui/material';

// 1. Definir tipos
interface Resposta {
  questaoTexto: string;
  nota?: number | null;
  comentario?: string | null;
  tipo: 'ESCOLHA_UNICA' | 'TEXTO_LIVRE';
}

interface AvaliacaoDetalhes {
  respostas: Resposta[];
  criado_em: string;
  media_final: number;
}

const AvaliacaoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detalhes, setDetalhes] = useState<AvaliacaoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDetalhes = async () => {
      try {
        const response = await api.get(`/evaluations/${id}`);
        console.log('API Response:', response.data);
        setDetalhes(response.data);
      } catch (error) {
        showNotification('Erro ao carregar detalhes da avaliação', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetalhes();
  }, [id, showNotification]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!detalhes) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="error">
          Não foi possível carregar os detalhes da avaliação.
        </Typography>
      </Container>
    );
  }

  // find a response that corresponds to a writing evaluation (questaoTexto contains 'escrit')
  const escritaIndex = detalhes.respostas.findIndex(r => /escrit/i.test(r.questaoTexto));
  const escritaResp = escritaIndex >= 0 ? detalhes.respostas[escritaIndex] : null;
  const otherResponses = detalhes.respostas.filter((_, idx) => idx !== escritaIndex);

  return (
    // 2. Usar Container e Paper para um layout limpo
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Detalhes da Avaliação
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Realizada em: {new Date(detalhes.criado_em).toLocaleDateString()}
        </Typography>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Média final: {Number(detalhes.media_final).toFixed(2)}
        </Typography>
        <Divider />
        
        {/* 3. Mostrar Avaliação de Escrita se existir */}
        {escritaResp && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Avaliação de Escrita</Typography>
            <Box sx={{ mt: 1, mb: 1 }}>
              {escritaResp.comentario ? (
                <Typography variant="body1" color="text.primary">{escritaResp.comentario}</Typography>
              ) : (
                <Typography variant="body1" color="text.primary">{escritaResp.nota !== null ? `Nota: ${escritaResp.nota}` : 'Sem resposta'}</Typography>
              )}
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Box>
        )}

        {/* 4. Usar <List> para as demais perguntas e respostas */}
        <List>
          {otherResponses.map((r, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <ListItemText
                  primary={
                    <Typography variant="h6" component="span" gutterBottom>
                      {r.questaoTexto}
                    </Typography>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Box>
                      {r.nota !== undefined && r.nota !== null && (
                        <Typography variant="body1" color="text.primary">Nota: {r.nota}</Typography>
                      )}
                      {r.comentario && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{r.comentario}</Typography>
                      )}
                    </Box>
                  }
                  sx={{ width: '100%' }}
                />
              </ListItem>
              {index < otherResponses.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AvaliacaoDetalhes;