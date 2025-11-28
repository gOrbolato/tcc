// Importa React, hooks do Material-UI, ícones e tipos.
import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider, useTheme } from '@mui/material';
import type { QuestionAnalysisItem } from '../../../../types/questionAnalysis';
import { ArrowUpward, ArrowDownward, Remove } from '@mui/icons-material';

/**
 * @component TrendDelta
 * @description Renderiza a variação (delta) de um valor em comparação com um período anterior,
 * mostrando um ícone de seta para cima (positivo), para baixo (negativo) ou um traço (sem alteração).
 */
const TrendDelta: React.FC<{ delta: number | null }> = ({ delta }) => {
  if (delta === null || delta === 0) {
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
        <Remove fontSize="small" />
        Sem alteração
      </Typography>
    );
  }

  const isPositive = delta > 0;
  const color = isPositive ? 'success.main' : 'error.main';
  const Icon = isPositive ? ArrowUpward : ArrowDownward;

  return (
    <Typography variant="caption" color={color} sx={{ display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
      <Icon fontSize="small" sx={{ mr: 0.5 }} />
      {delta.toFixed(2)} vs. período anterior
    </Typography>
  );
};

// Propriedades do componente principal.
interface QuestionAnalysisProps { analysis: QuestionAnalysisItem; }

/**
 * @component QuestionAnalysis
 * @description Um card detalhado que exibe a análise completa para uma única pergunta,
 * incluindo a média da nota, sentimento, sugestões geradas por IA e uma lista de comentários.
 */
const QuestionAnalysis: React.FC<QuestionAnalysisProps> = ({ analysis }) => {
  const theme = useTheme();

  // Objeto seguro para evitar erros de `null` ou `undefined` ao acessar as propriedades.
  const safeAnalysis: QuestionAnalysisItem = {
    name: analysis?.name || '—',
    average_score: analysis?.average_score || { value: 0, delta: null },
    score_distribution: analysis?.score_distribution || {},
    comments: Array.isArray(analysis?.comments) ? analysis.comments : [],
    sentiment_score: analysis?.sentiment_score || { value: 0, delta: null },
    suggestion: analysis?.suggestion || null,
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>{safeAnalysis.name}</Typography>
      
      {/* Seção de métricas principais (Média da Nota e Sentimento). */}
      <Box sx={{ display: 'flex', gap: 4, mt: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>{safeAnalysis.average_score.value.toFixed(2)}</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>Média da Nota</Typography>
          <TrendDelta delta={safeAnalysis.average_score.delta} />
        </Box>
        <Box>
          <Typography variant="h3" color="text.primary">{safeAnalysis.sentiment_score.value.toFixed(2)}</Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>Sentimento Médio</Typography>
          <TrendDelta delta={safeAnalysis.sentiment_score.delta} />
        </Box>
      </Box>
      
      {/* Seção de Análise e Sugestão da IA. */}
      {safeAnalysis.suggestion && (
        <Box sx={{ mt: 3, p: 2, background: theme.palette.background.default, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>Análise e Sugestão</Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <Typography component="span" sx={{ fontWeight: 'bold' }}>{safeAnalysis.suggestion.type}:</Typography>
            {' '}{safeAnalysis.suggestion.description}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 2 }}>Recomendação:</Typography>
          <Typography variant="body2" color="text.secondary">{safeAnalysis.suggestion.recommendation}</Typography>
        </Box>
      )}

      {/* Lista de comentários dos alunos. */}
      {safeAnalysis.comments.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Comentários dos Alunos</Typography>
          <List disablePadding>
            {safeAnalysis.comments.map((comment, index) => (
              <React.Fragment key={index}>
                <ListItem disableGutters><ListItemText primary={`“${comment}”`} /></ListItem>
                {index < safeAnalysis.comments.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );
};

export default QuestionAnalysis;
