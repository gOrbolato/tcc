import React from 'react';
import { Box, Typography, CircularProgress, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';

interface Evaluation {
  id: number;
  comentario_geral: string;
  media_final: number;
  created_at: string;
}

interface RawDataProps {
  data: Evaluation[] | null;
  loading: boolean;
}

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
