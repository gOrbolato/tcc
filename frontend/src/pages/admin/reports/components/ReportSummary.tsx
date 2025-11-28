// Importa React, componentes do Material-UI e ícones.
import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';

// Interface para um valor que possui uma tendência (valor atual e variação).
interface TrendValue {
  value: number;
  delta: number | null;
}

// Interface para as propriedades do componente de resumo.
interface ReportSummaryProps {
  data: {
    total_evaluations: TrendValue;
    average_media_final: TrendValue;
  } | null;
  loading: boolean;
}

/**
 * @component TrendDelta
 * @description Um componente visual para exibir a variação de um valor.
 * Mostra uma seta para cima para valores positivos, para baixo para negativos,
 * e um ícone neutro se não houver alteração.
 */
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

/**
 * @component ReportSummary
 * @description Exibe um resumo dos principais indicadores do relatório, como o total de
 * avaliações e a média final geral, incluindo a tendência de cada um.
 */
const ReportSummary: React.FC<ReportSummaryProps> = ({ data, loading }) => {
  return (
    <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
      <Typography variant="h6" gutterBottom>Resumo Geral</Typography>
      <Box sx={{ mt: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : data ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Total de Avaliações */}
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {data.total_evaluations.value}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Total de Avaliações</Typography>
                <TrendDelta delta={data.total_evaluations.delta} />
              </Box>
            </Box>
            {/* Média Final Geral */}
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
