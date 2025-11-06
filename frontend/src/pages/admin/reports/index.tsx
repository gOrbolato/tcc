import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import ReportFilters from './components/ReportFilters';
import type { QuestionAnalysisMap, QuestionAnalysisItem } from '../../../types/questionAnalysis';
import ReportSummary from './components/ReportSummary';
import AveragesChart from './components/AveragesChart';
import Suggestions from './components/Suggestions';
import ScoreDistributionChart from './components/ScoreDistributionChart';
import QuestionAnalysis from './components/QuestionAnalysis';
import RawData from './components/RawData';
import api from '../../../services/api';

type ReportData = {
  average_media_final: number;
  total_evaluations: number;
  averages_by_question: { [key: string]: number };
  suggestions: Array<{ type: string; category: string; score: number; sentiment: number; suggestion: string }>;
  score_distribution: { [key: string]: number };
  raw_data: Array<{ id: number; comentario_geral: string; media_final: number; created_at: string; }>;
  analysis_by_question: { [key: string]: any };
};

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCompleteReport, setShowCompleteReport] = useState(false);

  const fetchReport = async (institutionId?: number, courseId?: number) => {
    setLoading(true);
    setError(null);

    if (!institutionId) {
      setError('Por favor, selecione uma instituição para gerar o relatório.');
      setLoading(false);
      return;
    }

    try {
      // MODIFICADO: Chama o novo endpoint de análise
      const res = await api.get(`/analysis/institution/${institutionId}`);
      const raw = res.data || {};

      // A estrutura de normalização existente parece robusta e deve ser compatível
      const normalized = {
        average_media_final: Number(raw.average_media_final || raw.average_media || 0),
        total_evaluations: Number(raw.total_evaluations || raw.total || 0),
        averages_by_question: raw.averages_by_question || raw.averages || {},
        suggestions: raw.suggestions || [],
        score_distribution: raw.score_distribution || raw.scoreDistribution || {},
        raw_data: raw.raw_data || raw.rawData || [],
        analysis_by_question: (() => {
          const rawMap = raw.analysis_by_question || raw.analysisByQuestion || raw.analysis || {};
          const out: QuestionAnalysisMap = {};
          Object.entries(rawMap).forEach(([k, v]) => {
            const item = v as any;
            out[k] = {
              name: item.name || item.question || k,
              average_score: Number(item.average_score ?? item.average ?? 0),
              score_distribution: item.score_distribution || item.scoreDistribution || {},
              comments: Array.isArray(item.comments) ? item.comments : (item.comments ? [String(item.comments)] : []),
              sentiment_score: Number(item.sentiment_score ?? item.sentiment ?? 0),
              suggestion: item.suggestion || item.recommendation || '' ,
            } as QuestionAnalysisItem;
          });
          return out;
        })(),
      };

      setData(normalized as any);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao buscar relatório');
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      const res = await api.get('/admin/report/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_avaliacoes.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao baixar PDF');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" gutterBottom>Relatórios de Avaliações</Typography>
        <Button variant="text" onClick={downloadPdf} sx={{ color: '#1e88e5' }}>Download PDF</Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }} elevation={3}>
        <Typography variant="h6" gutterBottom>Filtros</Typography>
        <ReportFilters onSearch={fetchReport} onClear={() => setData(null)} loading={loading} />
      </Paper>

      {error && (
        <Paper sx={{ p: 2, mb: 2, backgroundColor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

// ... (rest of the file)

      {data ? (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="outlined" onClick={() => setShowCompleteReport(!showCompleteReport)}>
              {showCompleteReport ? 'Ver Relatório Resumido' : 'Ver Relatório Completo'}
            </Button>
          </Box>
          {showCompleteReport ? (
            Object.values(data.analysis_by_question).map((analysis: any, index: number) => (
              <QuestionAnalysis key={index} analysis={analysis} />
            ))
                    ) : (
                      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                        <ReportSummary data={data} loading={loading} />
                        <ScoreDistributionChart data={data.score_distribution} loading={loading} />
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <AveragesChart data={data.averages_by_question} loading={loading} />
                        </Box>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <Suggestions data={data.suggestions} loading={loading} />
                        </Box>
                        <Box sx={{ gridColumn: '1 / -1' }}>
                          <RawData data={data.raw_data} loading={loading} />
                        </Box>
                      </Box>
                    )}
        </>
      ) : (
        <Typography color="textSecondary">Preencha os filtros e clique em "Procurar" para ver os resultados.</Typography>
      )}
    </Box>
  );
};

export default Reports;
