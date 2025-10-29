// src/pages/user/AvaliacaoDetalhes.tsx
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
  resposta: string;
  tipo: 'ESCOLHA_UNICA' | 'TEXTO_LIVRE';
}

interface AvaliacaoDetalhes {
  disciplina: string;
  professor: string;
  respostas: Resposta[];
}

const AvaliacaoDetalhes: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detalhes, setDetalhes] = useState<AvaliacaoDetalhes | null>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchDetalhes = async () => {
      try {
        const response = await api.get(`/evaluations/details/${id}`); // Ajuste a rota
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

  return (
    // 2. Usar Container e Paper para um layout limpo
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {detalhes.disciplina}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Professor(a): {detalhes.professor}
        </Typography>
        <Divider />
        
        {/* 3. Usar <List> para as perguntas e respostas */}
        <List>
          {detalhes.respostas.map((r, index) => (
            <React.Fragment key={index}>
              <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {/* Pergunta */}
                <ListItemText
                  primary={
                    <Typography variant="h6" component="p" gutterBottom>
                      {r.questaoTexto}
                    </Typography>
                  }
                  // Resposta
                  secondary={
                    <Typography variant="body1" color="text.primary">
                      {r.resposta}
                    </Typography>
                  }
                  sx={{ width: '100%' }}
                />
              </ListItem>
              {index < detalhes.respostas.length - 1 && <Divider component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default AvaliacaoDetalhes;