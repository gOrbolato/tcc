import React from 'react';
import { Box, Typography, CircularProgress, Paper, useTheme } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AveragesChartProps {
  data: { [key: string]: number } | null;
  loading: boolean;
}

const AveragesChart: React.FC<AveragesChartProps> = ({ data, loading }) => {
  const theme = useTheme();

  const chartData = {
    labels: data ? Object.keys(data) : [],
    datasets: [
      {
        label: 'Média da Nota',
        data: data ? Object.values(data) : [],
        backgroundColor: data ? Object.values(data).map(value => 
          value >= 4.0 ? theme.palette.success.main : 
          value >= 3.0 ? theme.palette.warning.main : 
          theme.palette.error.main
        ) : [],
        borderColor: data ? Object.values(data).map(value => 
          value >= 4.0 ? theme.palette.success.dark : 
          value >= 3.0 ? theme.palette.warning.dark : 
          theme.palette.error.dark
        ) : [],
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `Média: ${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 5,
        grid: {
          color: theme.palette.divider,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.primary,
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">Gráfico de Médias por Pergunta</Typography>
      <Box sx={{ height: 400, mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
        ) : data && Object.keys(data).length > 0 ? (
          <Bar options={options} data={chartData} />
        ) : (
          <Typography color="textSecondary">Nenhum dado disponível para exibir o gráfico.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AveragesChart;
