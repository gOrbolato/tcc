import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

interface ReportSummaryProps {
  data: {
    total_evaluations: number;
    average_media_final: number;
  } | null;
  loading: boolean;
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ data, loading }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">Relatório Geral</Typography>
      <Box sx={{ mt: 1 }}>
        {loading ? (
          <CircularProgress size={20} />
        ) : data ? (
          <>
            <Typography>Total de Avaliações: <strong>{data.total_evaluations}</strong></Typography>
            <Typography>Média Final Geral: <strong>{Number(data.average_media_final).toFixed(2)}</strong></Typography>
          </>
        ) : (
          <Typography color="textSecondary">Nenhum dado disponível.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ReportSummary;
