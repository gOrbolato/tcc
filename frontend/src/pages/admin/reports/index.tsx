import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ReportFilters, { type SearchOptions } from './components/ReportFilters';
import TrendSelector from './components/TrendSelector';
import type { QuestionAnalysisItem } from '../../../types/questionAnalysis';
import ReportSummary from './components/ReportSummary';
import AveragesChart from './components/AveragesChart';
import Suggestions from './components/Suggestions';
import ScoreDistributionChart from './components/ScoreDistributionChart';
import api from '../../../services/api';

// Type definitions
interface TrendValue {
  value: number;
  delta: number | null;
}

type ReportData = {
  detailed_analysis: string;
  average_media_final: TrendValue;
  total_evaluations: TrendValue;
  averages_by_question: { [key: string]: TrendValue };
  score_distribution: { [key: string]: number };
  analysis_by_question: { [key: string]: QuestionAnalysisItem };
  raw_data: any[]; // Adicionando o campo que faltava
};

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentInstitutionId, setCurrentInstitutionId] = useState<number | undefined>();
  const [lastSearchOptions, setLastSearchOptions] = useState<SearchOptions | null>(null);

  const fetchReport = async (options: SearchOptions) => {
    setLoading(true);
    setError(null);
    setData(null);

    if (!options.institutionId) {
      setError('Por favor, selecione uma instituição para gerar o relatório.');
      setLoading(false);
      return;
    }
    
    setCurrentInstitutionId(options.institutionId);

    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });

      const res = await api.get(`/analysis/institution/${options.institutionId}`, { params });
      setData(res.data);
      setLastSearchOptions(options);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao buscar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setData(null);
    setCurrentInstitutionId(undefined);
    setLastSearchOptions(null);
  };

  const downloadPdf = async () => {
    if (!lastSearchOptions || !lastSearchOptions.institutionId) {
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(lastSearchOptions).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });

      const response = await api.get(`/analysis/institution/${lastSearchOptions.institutionId}/pdf`, {
        params,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio_avaliacao.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao baixar o PDF.');
    } finally {
      setLoading(false);
    }
  };

  const averagesChartData = data ? 
    Object.entries(data.averages_by_question).reduce((acc, [key, trendValue]) => {
      acc[key] = trendValue.value;
      return acc;
    }, {} as { [key: string]: number }) 
    : null;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" gutterBottom>Relatórios de Avaliações</Typography>
        <Button 
          variant="text" 
          onClick={downloadPdf} 
          sx={{ color: '#1e88e5' }}
          disabled={loading || !lastSearchOptions || !lastSearchOptions.institutionId}
        >
          Download PDF
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>Filtros</Typography>
        <ReportFilters onSearch={fetchReport} onClear={handleClear} loading={loading} />
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {data ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <TrendSelector onSearch={fetchReport} institutionId={currentInstitutionId} loading={loading} />
          </Box>
          <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <ReportSummary data={data} loading={loading} />
            <ScoreDistributionChart data={data.score_distribution} loading={loading} />
            <Box sx={{ gridColumn: '1 / -1' }}>
              <AveragesChart data={averagesChartData} loading={loading} />
            </Box>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Suggestions analysis={data.detailed_analysis} loading={loading} />
            </Box>
          </Box>
        </>
      ) : (
        !loading && <Typography color="textSecondary">Preencha os filtros e clique em "Procurar" para ver os resultados.</Typography>
      )}
    </Box>
  );
};

export default Reports;
