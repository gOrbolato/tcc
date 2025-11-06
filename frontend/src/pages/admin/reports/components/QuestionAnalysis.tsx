import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import type { QuestionAnalysisItem } from '../../../../types/questionAnalysis';
import Grid from '@mui/material/Grid';
import { Pie } from 'react-chartjs-2';

interface QuestionAnalysisProps { analysis: QuestionAnalysisItem; }

const QuestionAnalysis: React.FC<QuestionAnalysisProps> = ({ analysis }) => {
  // runtime guards: ensure required fields exist and have safe defaults
  const safeAnalysis: QuestionAnalysisItem = {
    name: analysis?.name || '—',
    average_score: typeof analysis?.average_score === 'number' ? analysis.average_score : 0,
    score_distribution: analysis?.score_distribution || {},
    comments: Array.isArray(analysis?.comments) ? analysis.comments : [],
    sentiment_score: typeof analysis?.sentiment_score === 'number' ? analysis.sentiment_score : 0,
    suggestion: analysis?.suggestion || '—',
  };
  const scoreDistributionData = {
    labels: Object.keys(safeAnalysis.score_distribution),
    datasets: [
      {
        data: Object.values(safeAnalysis.score_distribution),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
      },
    ],
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">{analysis.name}</Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 200px' }}>
          <Typography variant="h4">{analysis.average_score.toFixed(2)}</Typography>
          <Typography variant="subtitle1">Média</Typography>
        </Box>
        <Box sx={{ flex: '1 1 200px' }}>
          <Typography variant="h4">{analysis.sentiment_score.toFixed(2)}</Typography>
          <Typography variant="subtitle1">Sentimento</Typography>
        </Box>
        <Box sx={{ flex: '1 1 200px', height: 150 }}>
          <Pie data={scoreDistributionData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
    <Typography variant="h6">Sugestão</Typography>
    <Typography>{safeAnalysis.suggestion}</Typography>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Comentários</Typography>
        <List>
          {safeAnalysis.comments.map((comment, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText primary={comment} />
              </ListItem>
              {index < analysis.comments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Paper>
  );
};

export default QuestionAnalysis;
