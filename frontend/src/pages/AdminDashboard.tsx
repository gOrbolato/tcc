import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportDetail {
  instituicao: string;
  curso: string;
  total_avaliacoes: number;
  media_infraestrutura: number;
  media_material_didatico: number;
  observacoes_infraestrutura: string[];
  observacoes_material_didatico: string[];
}

interface AdminReports {
  overall_summary: {
    total_avaliacoes_geral: number;
    media_infraestrutura_geral: number;
    media_material_didatico_geral: number;
  };
  detailed_reports: ReportDetail[];
}

const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchReports = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/admin/reports', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setReports(data);
        } else {
          showNotification(data.message || 'Erro ao carregar relatórios.', 'error');
        }
      } catch (err) {
        showNotification('Ocorreu um erro ao carregar os relatórios.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [navigate, showNotification]);

  const overallChartData = {
    labels: ['Infraestrutura Geral', 'Material Didático Geral'],
    datasets: [
      {
        label: 'Média Geral',
        data: reports ? [reports.overall_summary.media_infraestrutura_geral, reports.overall_summary.media_material_didatico_geral] : [0, 0],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const detailedChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Médias por Instituição/Curso' },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
      },
    },
  };

  if (loading) return <p>Carregando relatórios...</p>;

  return (
    <div>
      <header>
        <nav>
          <Link to="/">Sair</Link>
          <Link to="/admin/users">Gerenciar Admins</Link>
          <Link to="/admin/institutions-courses">Gerenciar Instituições/Cursos</Link>
        </nav>
      </header>
      <main>
        <h1>Dashboard do Administrador</h1>
        <input type="text" placeholder="Pesquisar por instituição ou curso" />
        <button>Baixar Relatórios</button>
        <section>
          <h2>Análises</h2>
          {reports ? (
            <div>
              <h3>Resumo Geral</h3>
              <p>Total de Avaliações no Sistema: {reports.overall_summary.total_avaliacoes_geral}</p>
              <p>Média Geral de Infraestrutura: {reports.overall_summary.media_infraestrutura_geral}</p>
              <p>Média Geral de Material Didático: {reports.overall_summary.media_material_didatico_geral}</p>
              <div style={{ width: '80%', margin: '20px auto' }}>
                <Bar data={overallChartData} />
              </div>

              <h3>Relatórios Detalhados</h3>
              {reports.detailed_reports.length === 0 ? (
                <p>Nenhum relatório detalhado disponível.</p>
              ) : (
                reports.detailed_reports.map((report, index) => (
                  <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                    <h4>{report.instituicao} - {report.curso}</h4>
                    <p>Total de Avaliações: {report.total_avaliacoes}</p>
                    <p>Média Infraestrutura: {report.media_infraestrutura}</p>
                    <p>Média Material Didático: {report.media_material_didatico}</p>
                    {report.observacoes_infraestrutura.length > 0 && (
                      <p>Obs. Infraestrutura: {report.observacoes_infraestrutura.join('; ')}</p>
                    )}
                    {report.observacoes_material_didatico.length > 0 && (
                      <p>Obs. Material Didático: {report.observacoes_material_didatico.join('; ')}</p>
                    )}
                    <div style={{ width: '80%', margin: '10px auto' }}>
                      <Bar
                        data={{
                          labels: ['Infraestrutura', 'Material Didático'],
                          datasets: [
                            {
                              label: `Médias de ${report.instituicao} - ${report.curso}`,
                              data: [report.media_infraestrutura, report.media_material_didatico],
                              backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
                              borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={detailedChartOptions}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <p>Nenhum relatório disponível.</p>
          )}
        </section>
      </main>
    </div>
  );
};
