// Importa React e componentes do Material-UI.
import React from 'react';
import { Box, Typography, CircularProgress, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

// Interface para a estrutura de uma avaliação individual.
interface Evaluation {
  id: number;
  comentario_geral: string;
  media_final: number;
  criado_em: string;
}

// Interface para as propriedades do componente.
interface RawDataProps {
  data: Evaluation[] | null; // Array de avaliações ou nulo.
  loading: boolean; // Flag para indicar o estado de carregamento.
}

/**
 * @component RawData
 * @description Um componente que exibe uma lista de comentários gerais das avaliações.
 * Cada item da lista mostra o ID da avaliação, a nota final e o texto do comentário.
 */
const RawData: React.FC<RawDataProps> = ({ data, loading }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">Comentários Gerais</Typography>
      <Box sx={{ mt: 1 }}>
        {loading ? (
          <CircularProgress size={20} />
        ) : data && data.length > 0 ? (
          <List>
            {data.map((evaluation, index) => (
              <React.Fragment key={evaluation.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={`Avaliação #${evaluation.id}`}
                    secondary={
                      <>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          {`Nota: ${evaluation.media_final.toFixed(1)}`}
                        </Typography>
                        {` — ${evaluation.comentario_geral}`}
                      </>
                    }
                  />
                </ListItem>
                {/* Adiciona um divisor entre os itens, exceto no último. */}
                {index < data.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography color="textSecondary">Nenhum comentário disponível.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default RawData;
