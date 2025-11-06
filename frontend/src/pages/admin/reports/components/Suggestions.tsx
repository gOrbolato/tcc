import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

interface Suggestion {
  type: string;
  category: string;
  score: number;
  sentiment: number;
  suggestion: string;
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
            <Box key={idx} sx={{ mb: 1 }}>
              <Typography variant="subtitle2">{s.category} ({s.type})</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{s.suggestion}</Typography>
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
