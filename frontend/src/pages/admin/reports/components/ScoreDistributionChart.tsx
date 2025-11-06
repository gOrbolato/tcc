import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ScoreDistributionChartProps {
  data: { [key: string]: number } | null;
  loading: boolean;
}

const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ data, loading }) => {
  const chartData = {
    labels: ['1 Estrela', '2 Estrelas', '3 Estrelas', '4 Estrelas', '5 Estrelas'],
    datasets: [
      {
        label: 'Distribuição de Notas',
        data: data ? Object.values(data) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">Distribuição das Notas</Typography>
      <Box sx={{ height: 360, mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
        ) : data ? (
          <Pie data={chartData} />
        ) : (
          <Typography color="textSecondary">Nenhum dado disponível.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ScoreDistributionChart;
