// Importa React, hooks e componentes de UI.
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { Container, Paper, Typography, List, ListItem, ListItemText, Divider, CircularProgress, Box } from '@mui/material';

// Tipos para os dados da avaliação.
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

/**
 * @component AvaliacaoDetalhes
 * @description Página que exibe os detalhes de uma avaliação específica já realizada pelo usuário.
 */
const AvaliacaoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtém o ID da avaliação da URL.
  const [detalhes, setDetalhes] = useState<AvaliacaoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Busca os detalhes da avaliação da API ao carregar a página.
  useEffect(() => {
    const fetchDetalhes = async () => {
      try {
        const response = await api.get(`/evaluations/${id}`);
        setDetalhes(response.data);
      } catch (error) {
        showNotification('Erro ao carregar detalhes da avaliação', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDetalhes();
  }, [id, showNotification]);

  // Exibe um spinner de carregamento enquanto os dados estão sendo buscados.
  if (loading) {
    return <Container sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Container>;
  }

  // Exibe uma mensagem de erro se os detalhes não puderem ser carregados.
  if (!detalhes) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="error">Não foi possível carregar os detalhes da avaliação.</Typography>
      </Container>
    );
  }

  // Separa a resposta da avaliação de escrita das outras para exibição especial.
  const escritaIndex = detalhes.respostas.findIndex(r => /escrit/i.test(r.questaoTexto));
  const escritaResp = escritaIndex >= 0 ? detalhes.respostas[escritaIndex] : null;
  const otherResponses = detalhes.respostas.filter((_, idx) => idx !== escritaIndex);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>Detalhes da Avaliação</Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>Realizada em: {new Date(detalhes.criado_em).toLocaleDateString()}</Typography>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>Média final: {Number(detalhes.media_final).toFixed(2)}</Typography>
        <Divider />
        
        {/* Seção para a avaliação de escrita, se existir. */}
        {escritaResp && (
          <Box sx={{ my: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Avaliação de Escrita</Typography>
            <Typography variant="body1" color="text.primary" sx={{ mt: 1 }}>{escritaResp.comentario || `Nota: ${escritaResp.nota}` || 'Sem resposta'}</Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>
        )}

        {/* Lista com as demais perguntas e respostas. */}
        <List>
          {otherResponses.map((r, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <ListItemText
                  primary={<Typography variant="h6" component="span" gutterBottom>{r.questaoTexto}</Typography>}
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Box>
                      {r.nota != null && <Typography variant="body1" color="text.primary">Nota: {r.nota}</Typography>}
                      {r.comentario && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{r.comentario}</Typography>}
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