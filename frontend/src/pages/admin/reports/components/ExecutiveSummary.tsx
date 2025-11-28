// Importa React e componentes do Material-UI.
import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

// Interface para as propriedades do componente.
interface ExecutiveSummaryProps {
  summary: string; // O texto do resumo executivo.
}

/**
 * @component FormattedSummary
 * @description Um sub-componente que formata o texto do resumo,
 * convertendo texto entre `**` em tags `<strong>` para deixá-lo em negrito.
 */
const FormattedSummary: React.FC<{ text: string }> = ({ text }) => {
  // Divide o texto com base na sintaxe `**texto**`, mantendo os delimitadores.
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);

  return (
    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
      {parts.map((part, index) => {
        // Se a parte do texto corresponde ao padrão de negrito...
        if (part.startsWith('**') && part.endsWith('**')) {
          // ...renderiza como `<strong>` sem os asteriscos.
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        // Caso contrário, renderiza como texto normal.
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </Typography>
  );
};

/**
 * @component ExecutiveSummary
 * @description Exibe o resumo executivo da análise em um card estilizado.
 * Utiliza o sub-componente `FormattedSummary` para formatar o texto.
 */
const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
  // Se não houver resumo, não renderiza nada.
  if (!summary) {
    return null;
  }

  return (
    <Paper sx={{ p: 3, mb: 3, backgroundColor: 'primary.lighter', borderLeft: 5, borderColor: 'primary.main' }} elevation={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
        <InfoIcon color="primary" sx={{ mr: 1.5 }} />
        <Typography variant="h6" component="h2" color="primary.dark">
          Resumo Executivo da Análise
        </Typography>
      </Box>
      <FormattedSummary text={summary} />
    </Paper>
  );
};

export default ExecutiveSummary;
