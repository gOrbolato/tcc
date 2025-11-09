import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ReportFilters, { type SearchOptions } from './components/ReportFilters';
import TrendSelector from './components/TrendSelector';
import ExecutiveSummary from './components/ExecutiveSummary';
import type { QuestionAnalysisItem } from '../../../types/questionAnalysis';
import ReportSummary from './components/ReportSummary';
import AveragesChart from './components/AveragesChart';
import Suggestions from './components/Suggestions';
import ScoreDistributionChart from './components/ScoreDistributionChart';
import RawData from './components/RawData';
import api from '../../../services/api';

// Type definitions
interface TrendValue {
  value: number;
  delta: number | null;
}

interface Suggestion {
  category: string;
  score: number;
  suggestion: {
    type: string;
    description: string;
    recommendation: string;
  } | null;
}

type ReportData = {
  executive_summary: string;
  average_media_final: TrendValue;
  total_evaluations: TrendValue;
  averages_by_question: { [key: string]: TrendValue };
  suggestions: Suggestion[];
  score_distribution: { [key: string]: number };
  raw_data: Array<{ id: number; comentario_geral: string; media_final: number; criado_em: string; }>;
  analysis_by_question: { [key: string]: QuestionAnalysisItem };
};

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentInstitutionId, setCurrentInstitutionId] = useState<number | undefined>();
  const [lastSearchOptions, setLastSearchOptions] = useState<SearchOptions | null>(null); // NEW STATE

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
      setLastSearchOptions(options); // SET LAST SEARCH OPTIONS
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao buscar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setData(null);
    setCurrentInstitutionId(undefined);
    setLastSearchOptions(null); // CLEAR LAST SEARCH OPTIONS
  };

  const downloadPdf = async () => {
    if (!lastSearchOptions || !lastSearchOptions.institutionId) {
      // Optionally show a notification
      return;
    }

    setLoading(true); // Indicate loading for download
    try {
      const params = new URLSearchParams();
      Object.entries(lastSearchOptions).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });

      const response = await api.get(`/analysis/institution/${lastSearchOptions.institutionId}/pdf`, {
        params,
        responseType: 'blob', // Important for downloading binary data
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'relatorio_avaliacao.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url); // Clean up the URL object

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
          disabled={loading || !lastSearchOptions || !lastSearchOptions.institutionId} // Disable if no report is loaded
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
          <ExecutiveSummary summary={data.executive_summary} />
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
              <Suggestions data={data.suggestions} loading={loading} />
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
