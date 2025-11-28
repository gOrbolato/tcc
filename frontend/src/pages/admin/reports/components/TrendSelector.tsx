// Importa React, componentes do Material-UI, dayjs para manipulação de datas e tipos.
import React from 'react';
import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { type SearchOptions } from './ReportFilters';

// Interface para as propriedades do componente.
interface TrendSelectorProps {
  onSearch: (options: SearchOptions) => void; // Função para iniciar a busca com os períodos de tempo.
  institutionId: number | undefined; // ID da instituição para a qual a comparação será feita.
  loading: boolean; // Flag para desabilitar os botões durante o carregamento.
}

/**
 * @component TrendSelector
 * @description Um componente que fornece botões ("Semestral", "Anual") para o usuário
 * selecionar um período de comparação de tendências. Ele calcula as datas de início e fim
 * para o período atual e o anterior e chama a função `onSearch` com essas datas.
 */
const TrendSelector: React.FC<TrendSelectorProps> = ({ onSearch, institutionId, loading }) => {
  
  // Função para lidar com a seleção do período de tempo.
  const handleTimeframeSearch = (timeframe: 'semester' | 'year') => {
    if (!institutionId) return;

    const now = dayjs();
    let currentStart, currentEnd, previousStart, previousEnd;

    // Lógica para calcular os períodos de comparação semestral.
    if (timeframe === 'semester') {
      if (now.month() >= 6) { // Julho a Dezembro
        // Período Atual: Primeiro semestre do ano corrente.
        currentStart = now.startOf('year');
        currentEnd = now.month(5).endOf('month');
        // Período Anterior: Segundo semestre do ano anterior.
        previousStart = now.subtract(1, 'year').month(6).startOf('month');
        previousEnd = now.subtract(1, 'year').endOf('year');
      } else { // Janeiro a Junho
        // Período Atual: Segundo semestre do ano anterior.
        currentStart = now.subtract(1, 'year').month(6).startOf('month');
        currentEnd = now.subtract(1, 'year').endOf('year');
        // Período Anterior: Primeiro semestre do ano anterior.
        previousStart = now.subtract(1, 'year').startOf('year');
        previousEnd = now.subtract(1, 'year').month(5).endOf('month');
      }
    } else { // Lógica para comparação anual.
      // Período Atual: Ano completo anterior.
      currentStart = now.subtract(1, 'year').startOf('year');
      currentEnd = now.subtract(1, 'year').endOf('year');
      // Período Anterior: Ano completo de dois anos atrás.
      previousStart = now.subtract(2, 'year').startOf('year');
      previousEnd = now.subtract(2, 'year').endOf('year');
    }

    // Monta o objeto de opções de busca e chama o callback.
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
