import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/UserArea.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Interfaces ---
interface PythonAnalysisResult {
  averages_by_question: { [key: string]: number };
  suggestions: Array<{ type: string; category: string; score: number; sentiment: number; suggestion: string }>;
}

interface ReportData extends PythonAnalysisResult {
  average_media_final: number;
  total_evaluations: number;
}

interface Evaluation { id: number; instituicao_nome: string; curso_nome: string; usuario_ra: string; media_final: number; criado_em: string; }
interface Institution { id: number; nome: string; }
interface Course { id: number; nome: string; }
// ------------------

const questionLabels: { [key: string]: string } = {
  nota_infraestrutura: 'Infraestrutura',
  nota_coordenacao: 'Coordenação',
  nota_direcao: 'Direção',
  nota_localizacao: 'Localização',
  nota_acessibilidade: 'Acessibilidade',
  nota_equipamentos: 'Equipamentos',
  nota_biblioteca: 'Biblioteca',
  nota_didatica: 'Didática',
  nota_conteudo: 'Conteúdo',
  nota_dinamica_professores: 'Dinâmica Prof.',
  nota_disponibilidade_professores: 'Disp. Prof.',
};

const VisualizarAvaliacoes: React.FC = () => {
  // --- Estados ---
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [instFilter, setInstFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState({ inst: '', course: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const { showNotification } = useNotification();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  // ------------------

  // --- Lógica de Dados ---
  const fetchReportData = useCallback(async () => {
    setPageLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilters.inst) params.append('institutionId', activeFilters.inst);
      if (activeFilters.course) params.append('courseId', activeFilters.course);

      console.log("DEBUG: Chamando API para /admin/reports com params:", params.toString());

      const reportRes = await api.get(`/admin/reports?${params.toString()}`);
      setReportData(reportRes.data);
      // A API de /evaluations não é mais necessária aqui, pois o Python já processa tudo
      setEvaluations([]); // Limpa as avaliações detalhadas, se não forem mais usadas
      console.log("DEBUG: Dados do relatório recebidos:", reportRes.data);
    } catch (error) { 
      console.error("ERRO: Erro ao carregar dados do relatório", error);
      showNotification('Erro ao carregar dados.', 'error'); 
      setReportData(null);
      setEvaluations([]);
    }
    finally { setPageLoading(false); }
  }, [activeFilters, showNotification]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [instRes, courseRes] = await Promise.all([api.get('/institutions'), api.get('/courses')]);
      setInstitutions(instRes.data);
      setCourses(courseRes.data);
    } catch (error) {
      console.error("ERRO: Erro ao carregar dados para os filtros", error);
      showNotification('Erro ao carregar dados para os filtros.', 'error');
    }
  }, [showNotification]);

  useEffect(() => {
    if (isAuthLoading) return; 

    if (!user || !user.isAdmin) {
      navigate('/login'); 
      return;
    }

    fetchFilterOptions(); 

    if (hasSearched) {
      fetchReportData();
    } else {
      setPageLoading(false); 
    }
  }, [isAuthLoading, user, hasSearched, fetchReportData, fetchFilterOptions, navigate]);
  // ------------------

  // --- Handlers ---
  const handleSearch = () => { setHasSearched(true); setActiveFilters({ inst: instFilter, course: courseFilter }); };
  const handleClearFilters = () => { setInstFilter(''); setCourseFilter(''); setActiveFilters({ inst: '', course: '' }); setHasSearched(false); setReportData(null); setEvaluations([]); };
  // ------------------

  // --- Gráfico de Médias ---
  const chartData = useMemo(() => {
    if (!reportData || !reportData.averages_by_question) return { labels: [], datasets: [] };
    const labels = Object.keys(reportData.averages_by_question).map(key => questionLabels[key] || key);
    const data = Object.values(reportData.averages_by_question);

    return {
      labels,
      datasets: [
        {
          label: 'Média das Notas',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }, [reportData]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Médias por Pergunta' },
    },
    scales: {
      y: { beginAtZero: true, max: 5 },
    },
  };

  // --- Renderização ---
  if (isAuthLoading || pageLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  if (!user || !user.isAdmin) {
    return <section className="page-section"><div className="section-content"><p>Acesso negado. Você não tem permissão de administrador.</p></div></section>;
  }

  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Análise de Avaliações</h1>
        <div className="page-actions">
          <Link to="/admin/dashboard" className="btn btn-secondary">← Voltar ao Painel</Link>
          <button onClick={handleClearFilters} className="btn btn-secondary">Limpar Filtros</button>
        </div>

        <div className="card">
          <h2>Filtros</h2>
          <div className="form-group">
            <select value={instFilter} onChange={e => setInstFilter(e.target.value)} className="form-control">
              <option value="">Todas as Instituições</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="form-control">
              <option value="">Todos os Cursos</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <button type="button" onClick={handleSearch} className="btn btn-primary">Procurar</button>
        </div>

        {!hasSearched ? (
          <div className="card" style={{textAlign: 'center'}}><p>Preencha os filtros e clique em "Procurar" para ver os resultados.</p></div>
        ) : reportData && reportData.total_evaluations > 0 ? (
          <>
            <div className="card">
              <h2>Relatório Geral</h2>
              <div className="report-summary">
                <p><strong>Total de Avaliações:</strong> {reportData.total_evaluations}</p>
                <p><strong>Média Final Geral:</strong> {reportData.average_media_final?.toFixed(2)}</p>
              </div>
            </div>

            <div className="card">
              <h2>Médias por Pergunta</h2>
              <div className="averages-grid">
                {Object.entries(reportData.averages_by_question).map(([key, value]) => (
                  <div key={key} className="average-item">
                    <p><strong>{questionLabels[key] || key}:</strong> {value?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h2>Gráfico de Médias por Pergunta</h2>
              <Bar options={chartOptions} data={chartData} />
            </div>

            {reportData.suggestions && reportData.suggestions.length > 0 && (
              <div className="card">
                <h2>Sugestões e Insights</h2>
                {reportData.suggestions.map((s, index) => (
                  <div key={index} className="suggestion-item">
                    <p><strong>{s.category} ({s.type}):</strong> {s.suggestion}</p>

                  </div>
                ))}
              </div>
            )}

            {/* A tabela de avaliações detalhadas foi removida para anonimato */}

          </>
        ) : (
          <div className="card" style={{textAlign: 'center'}}><p>Nenhum dado para este relatório.</p></div>
        )}
      </div>
    </section>
  );
};

export default VisualizarAvaliacoes;
