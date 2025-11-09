import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface ExecutiveSummaryProps {
  summary: string;
}

// Componente para renderizar o resumo com quebras de linha e negrito
const FormattedSummary: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g).filter(part => part);

  return (
    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </Typography>
  );
};

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ summary }) => {
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
