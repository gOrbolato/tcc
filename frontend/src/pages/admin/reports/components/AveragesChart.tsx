// Importa React, hooks e componentes do Material-UI.
import React from 'react';
import { Box, Typography, CircularProgress, Paper, useTheme } from '@mui/material';
// Importa os componentes necessários da biblioteca `chart.js` e o wrapper `react-chartjs-2`.
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registra os componentes do Chart.js que serão utilizados.
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Interface para as propriedades do componente.
interface AveragesChartProps {
  data: { [key: string]: number } | null; // Dados do gráfico: um objeto onde a chave é o nome da pergunta e o valor é a média.
  loading: boolean; // Flag para indicar se os dados estão sendo carregados.
}

/**
 * @component AveragesChart
 * @description Renderiza um gráfico de barras horizontais mostrando a média das notas para cada pergunta.
 * As cores das barras mudam de acordo com o valor da média (verde, amarelo, vermelho).
 */
const AveragesChart: React.FC<AveragesChartProps> = ({ data, loading }) => {
  const theme = useTheme(); // Hook do Material-UI para acessar o tema atual.

  // Estrutura de dados para o Chart.js.
  const chartData = {
    labels: data ? Object.keys(data) : [], // Rótulos do eixo Y (nomes das perguntas).
    datasets: [
      {
        label: 'Média da Nota',
        data: data ? Object.values(data) : [], // Valores do gráfico (médias).
        // Define a cor de fundo de cada barra com base no seu valor.
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

  // Opções de configuração para o Chart.js.
  const options = {
    indexAxis: 'y' as const, // Define o gráfico como de barras horizontais.
    responsive: true,
    maintainAspectRatio: false, // Permite que o gráfico preencha o contêiner.
    plugins: {
      legend: { display: false }, // Oculta a legenda.
      title: { display: false }, // Oculta o título.
      tooltip: { // Configurações do popup que aparece ao passar o mouse.
        backgroundColor: theme.palette.background.paper,
        titleColor: theme.palette.text.primary,
        bodyColor: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderWidth: 1,
        callbacks: {
          label: (context: any) => `Média: ${context.raw.toFixed(2)}`, // Formata o texto do tooltip.
        },
      },
    },
    scales: { // Configurações dos eixos.
      x: {
        beginAtZero: true,
        max: 5, // Eixo X vai de 0 a 5.
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary },
      },
      y: {
        grid: { display: false }, // Oculta as linhas de grade do eixo Y.
        ticks: { color: theme.palette.text.primary },
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
