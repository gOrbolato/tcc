import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

interface Suggestion {
  category: string;
  score: number;
  suggestion: {
    type: string;
    description: string;
    recommendation: string;
  } | null;
}

interface SuggestionsProps {
  data: Suggestion[] | null;
  loading: boolean;
}

const Suggestions: React.FC<SuggestionsProps> = ({ data, loading }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">Sugestões e Insights</Typography>
      <Box sx={{ mt: 1 }}>
        {loading ? (
          <CircularProgress size={20} />
        ) : data && data.length > 0 ? (
          data.map((s, idx) => (
            <Box key={idx} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                {s.category}
                <Typography component="span" variant="body2" sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold' }}>
                  (Média: {s.score.toFixed(1)})
                </Typography>
              </Typography>
              
              {s.suggestion ? (
                <>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>{s.suggestion.type}:</Box>
                    {s.suggestion.description}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Recomendação:
                  </Typography>
                  <Typography variant="body1">
                    {s.suggestion.recommendation}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma sugestão específica para esta categoria.
                </Typography>
              )}
            </Box>
          ))
        ) : (
          <Typography color="textSecondary">Nenhuma sugestão gerada.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Suggestions;
