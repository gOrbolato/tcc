import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AveragesChartProps {
  data: { [key: string]: number } | null;
  loading: boolean;
}

const QUESTION_LABELS: { [key: string]: string } = {
  nota_infraestrutura: 'Infraestrutura',
  nota_coordenacao: 'Coordenação',
  nota_direcao: 'Direção',
  nota_localizacao: 'Localização',
  nota_acessibilidade: 'Acessibilidade',
  nota_equipamentos: 'Equipamentos',
  nota_biblioteca: 'Biblioteca',
  nota_didatica: 'Didática',
  nota_conteudo: 'Conteúdo',
  nota_dinamica_professores: 'Dinâmica dos Professores',
  nota_disponibilidade_professores: 'Disponibilidade dos Professores',
};

const AveragesChart: React.FC<AveragesChartProps> = ({ data, loading }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
      <Typography variant="h6">Gráfico de Médias por Pergunta</Typography>
      <Box sx={{ height: 360, mt: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><CircularProgress /></Box>
        ) : data ? (
          <Bar
            data={{
              labels: Object.keys(data).map(k => QUESTION_LABELS[k] || k.replace('nota_', '').replace(/_/g, ' ')),
              datasets: [{
                label: 'Média das Notas',
                data: Object.values(data),
                backgroundColor: Object.values(data).map(v => v >= 4.5 ? 'rgba(75,192,192,0.9)' : 'rgba(75,192,192,0.6)'),
                borderColor: 'rgba(34,139,139,0.9)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false }, title: { display: false }, tooltip: { mode: 'index', intersect: false } },
              scales: {
                y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
              }
            }}
          />
        ) : (
          <Typography color="textSecondary">Nenhum dado disponível.</Typography>
        )}
      </Box>
    </Paper>
  );
};

export default AveragesChart;
