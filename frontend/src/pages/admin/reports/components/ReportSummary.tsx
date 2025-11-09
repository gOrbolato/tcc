import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';

interface TrendValue {
  value: number;
  delta: number | null;
}

interface ReportSummaryProps {
  data: {
    total_evaluations: TrendValue;
    average_media_final: TrendValue;
  } | null;
  loading: boolean;
}

// Componente para renderizar a variação (delta)
const TrendDelta: React.FC<{ delta: number | null, isPercentage?: boolean }> = ({ delta, isPercentage = false }) => {
  if (delta === null || delta === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
        <Remove fontSize="small" />
        Sem alteração
      </Typography>
    );
  }

  const isPositive = delta > 0;
  const color = isPositive ? 'success.main' : 'error.main';
  const Icon = isPositive ? ArrowUpward : ArrowDownward;
  const signal = isPositive ? '+' : '';
  const unit = isPercentage ? '%' : '';

  return (
    <Typography variant="caption" color={color} sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', ml: 1 }}>
      <Icon fontSize="small" sx={{ mr: 0.5 }} />
      {signal}{delta.toFixed(2)}{unit}
    </Typography>
  );
};


const ReportSummary: React.FC<ReportSummaryProps> = ({ data, loading }) => {
  console.log('--- DEBUG: ReportSummary data prop ---', JSON.stringify(data, null, 2));
  return (
    <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
      <Typography variant="h6" gutterBottom>Resumo Geral</Typography>
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : data ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data.total_evaluations.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Total de Avaliações</Typography>
                <TrendDelta delta={data.total_evaluations.delta} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data.average_media_final.value.toFixed(2)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Média Final Geral</Typography>
                <TrendDelta delta={data.average_media_final.delta} />
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography color="textSecondary">Nenhum dado disponível.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ReportSummary;
