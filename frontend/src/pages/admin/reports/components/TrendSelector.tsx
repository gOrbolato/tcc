import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { type SearchOptions } from './ReportFilters';

interface TrendSelectorProps {
  onSearch: (options: SearchOptions) => void;
  institutionId: number | undefined;
  loading: boolean;
}

const TrendSelector: React.FC<TrendSelectorProps> = ({ onSearch, institutionId, loading }) => {
  
  const handleTimeframeSearch = (timeframe: 'semester' | 'year') => {
    if (!institutionId) return;

    const now = dayjs();
    let currentStart, currentEnd, previousStart, previousEnd;

    if (timeframe === 'semester') {
      if (now.month() >= 6) { // Se estamos de Julho a Dezembro (mês 0-indexado)
        // Período Atual: Jan-Jun do ano corrente
        currentStart = dayjs().startOf('year'); // 1º de Jan do ano corrente
        currentEnd = dayjs().month(5).endOf('month'); // 30 de Jun do ano corrente

        // Período Anterior: Jul-Dez do ano anterior
        previousStart = dayjs().subtract(1, 'year').month(6).startOf('month'); // 1º de Jul do ano anterior
        previousEnd = dayjs().subtract(1, 'year').endOf('year'); // 31 de Dez do ano anterior
      } else { // Se estamos de Janeiro a Junho
        // Período Atual: Jul-Dez do ano anterior
        currentStart = dayjs().subtract(1, 'year').month(6).startOf('month'); // 1º de Jul do ano anterior
        currentEnd = dayjs().subtract(1, 'year').endOf('year'); // 31 de Dez do ano anterior

        // Período Anterior: Jan-Jun do ano anterior
        previousStart = dayjs().subtract(1, 'year').startOf('year'); // 1º de Jan do ano anterior
        previousEnd = dayjs().subtract(1, 'year').month(5).endOf('month'); // 30 de Jun do ano anterior
      }
    } else { // timeframe === 'year'
      // Período Atual: Ano completo anterior
      currentStart = dayjs().subtract(1, 'year').startOf('year'); // 1º de Jan do ano anterior
      currentEnd = dayjs().subtract(1, 'year').endOf('year'); // 31 de Dez do ano anterior

      // Período Anterior: Ano completo dois anos atrás
      previousStart = dayjs().subtract(2, 'year').startOf('year'); // 1º de Jan de dois anos atrás
      previousEnd = dayjs().subtract(2, 'year').endOf('year'); // 31 de Dez de dois anos atrás
    }

    const options: SearchOptions = {
      institutionId,
      currentStart: currentStart.format('YYYY-MM-DD'),
      currentEnd: currentEnd.format('YYYY-MM-DD'),
      previousStart: previousStart.format('YYYY-MM-DD'),
      previousEnd: previousEnd.format('YYYY-MM-DD'),
    };
    
    onSearch(options);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Typography variant="subtitle1">Comparar com período anterior:</Typography>
      <ButtonGroup variant="outlined" aria-label="Período de comparação">
        <Button onClick={() => handleTimeframeSearch('semester')} disabled={loading}>
          Semestral
        </Button>
        <Button onClick={() => handleTimeframeSearch('year')} disabled={loading}>
          Anual
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default TrendSelector;
