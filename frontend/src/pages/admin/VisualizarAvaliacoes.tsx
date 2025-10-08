import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Admin.css';

// --- Interfaces para os dados ---
interface ReportData {
  average_media_final: number;
  average_nota_infraestrutura: number;
  average_nota_material_didatico: number;
  total_evaluations: number;
  evaluations_by_institution: { [key: string]: number };
  word_cloud: { [key: string]: number };
}

interface Evaluation {
  id: number;
  instituicao_nome: string;
  curso_nome: string;
  usuario_ra: string;
  media_final: number;
  criado_em: string;
}

interface Institution {
  id: number;
  nome: string;
}

interface Course {
  id: number;
  nome: string;
}
// --------------------------------

const VisualizarAvaliacoes: React.FC = () => {
  // --- Estados do Componente ---
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [loadingReport, setLoadingReport] = useState<boolean>(true);
  const [loadingEvaluations, setLoadingEvaluations] = useState<boolean>(true);
  
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { showNotification } = useNotification();
  // --------------------------------

  // --- Efeitos de Busca de Dados ---

  // Busca o relatório geral (apenas uma vez)
  useEffect(() => {
    const fetchReport = async () => {
      setLoadingReport(true);
      try {
        const response = await api.get('/admin/reports');
        setReportData(response.data);
      } catch (error) {
        showNotification('Erro ao carregar o relatório geral.', 'error');
      } finally {
        setLoadingReport(false);
      }
    };
    fetchReport();
  }, [showNotification]);

  // Busca a lista de avaliações detalhadas (roda sempre que um filtro muda)
  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoadingEvaluations(true);
      try {
        const params = new URLSearchParams();
        if (selectedInstitution) params.append('institutionId', selectedInstitution);
        if (selectedCourse) params.append('courseId', selectedCourse);

        const response = await api.get(`/evaluations?${params.toString()}`);
        setEvaluations(response.data);
      } catch (error) {
        showNotification('Erro ao carregar a lista de avaliações.', 'error');
      } finally {
        setLoadingEvaluations(false);
      }
    };
    fetchEvaluations();
  }, [selectedInstitution, selectedCourse, showNotification]);

  // Busca os dados para os menus de filtro (apenas uma vez)
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [instRes, courseRes] = await Promise.all([api.get('/institutions'), api.get('/courses')]);
        setInstitutions(instRes.data);
        setCourses(courseRes.data);
      } catch (error) {
        showNotification('Erro ao carregar dados para os filtros.', 'error');
      }
    };
    fetchFilterData();
  }, [showNotification]);
  // --------------------------------

  return (
    <div className="admin-container">
      <Link to="/admin/dashboard" className="admin-back-link">← Voltar ao Painel</Link>
      <header className="admin-header">
        <h1>Análise de Avaliações</h1>
        <p>Explore os dados consolidados e filtre por avaliações individuais.</p>
      </header>

      {/* Seção de Filtros */}
      <div className="admin-section">
        <h2>Filtros</h2>
        <form className="admin-form">
          <select value={selectedInstitution} onChange={(e) => setSelectedInstitution(e.target.value)}>
            <option value="">Todas as Instituições</option>
            {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.nome}</option>)}
          </select>
          <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
            <option value="">Todos os Cursos</option>
            {courses.map(course => <option key={course.id} value={course.id}>{course.nome}</option>)}
          </select>
        </form>
      </div>

      {/* Seção do Relatório Geral */}
      <div className="admin-section">
        <h2>Relatório Geral</h2>
        {loadingReport ? <p>Carregando relatório...</p> : reportData ? (
          <div className="admin-nav"> {/* Reutilizando o layout de grid para os cards */}
            <div className="admin-nav-item"><h2>Total de Avaliações</h2><p style={{fontSize: '1.5rem'}}>{reportData.total_evaluations}</p></div>
            <div className="admin-nav-item"><h2>Média Final Geral</h2><p style={{fontSize: '1.5rem'}}>{reportData.average_media_final?.toFixed(2)}</p></div>
            <div className="admin-nav-item"><h2>Média Infraestrutura</h2><p style={{fontSize: '1.5rem'}}>{reportData.average_nota_infraestrutura?.toFixed(2)}</p></div>
          </div>
        ) : <p>Não foi possível gerar o relatório.</p>}
      </div>

      {/* Seção da Tabela de Avaliações Detalhadas */}
      <div className="admin-section">
        <h2>Avaliações Detalhadas</h2>
        {loadingEvaluations ? <p>Carregando avaliações...</p> : evaluations.length > 0 ? (
          <table className="management-table">
            <thead>
              <tr>
                <th>Instituição</th>
                <th>Curso</th>
                <th>RA do Aluno</th>
                <th>Média Final</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.map(ev => (
                <tr key={ev.id}>
                  <td>{ev.instituicao_nome}</td>
                  <td>{ev.curso_nome}</td>
                  <td>{ev.usuario_ra}</td>
                  <td>{ev.media_final.toFixed(2)}</td>
                  <td>{new Date(ev.criado_em).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>Nenhuma avaliação encontrada para os filtros selecionados.</p>}
      </div>

    </div>
  );
};

export default VisualizarAvaliacoes;