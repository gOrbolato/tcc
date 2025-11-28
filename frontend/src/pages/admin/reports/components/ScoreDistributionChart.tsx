// Importa React, hooks e componentes do Material-UI.
import React from 'react';
import { Box, Typography, CircularProgress, Paper, useTheme } from '@mui/material';
// Importa os componentes do Chart.js para criar o gráfico.
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registra os módulos do Chart.js necessários para um gráfico de barras.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Interface para as propriedades do componente.
interface ScoreDistributionChartProps {
  data: { [key: string]: number } | null; // Dados: um objeto onde a chave é a nota (1 a 5) e o valor é a quantidade de votos.
  loading: boolean;
}

/**
 * @component ScoreDistributionChart
 * @description Renderiza um gráfico de barras verticais que mostra a distribuição
 * das notas (quantas avaliações receberam 1 estrela, 2 estrelas, etc.).
 */
const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ data, loading }) => {
  const theme = useTheme();

  const labels = ['1 Estrela', '2 Estrelas', '3 Estrelas', '4 Estrelas', '5 Estrelas'];
  
  // Mapeia os dados para garantir a ordem correta (1 a 5) e lida com valores ausentes.
  const chartValues = data ? labels.map((_label, index) => data[String(index + 1)] || 0) : [];

  // Define cores para cada barra com base na nota.
  const backgroundColors = [
    theme.palette.error.main,
    theme.palette.error.light,
    theme.palette.warning.main,
    theme.palette.success.light,
    theme.palette.success.main,
  ];
  const borderColors = [
    theme.palette.error.dark,
    theme.palette.error.main,
    theme.palette.warning.dark,
    theme.palette.success.main,
    theme.palette.success.dark,
  ];

  // Estrutura de dados para o Chart.js.
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Quantidade de Votos',
        data: chartValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  // Opções de configuração para o gráfico.
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Distribuição Geral das Notas',
        color: theme.palette.text.primary,
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw} votos`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: theme.palette.divider },
        ticks: {
          color: theme.palette.text.secondary,
          stepSize: 1, // Garante que o eixo Y mostre apenas números inteiros.
        },
        title: {
          display: true,
          text: 'Nº de Avaliações',
          color: theme.palette.text.secondary,
        },
      },
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.primary },
      },
    },
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">Distribuição das Notas</Typography>
      <Box sx={{ height: 300, mt: 2 }}>
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

export default ScoreDistributionChart;
