
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Dashboard.css'; // Importando o novo CSS

interface Evaluation {
  id: number;
  instituicao_nome: string;
  curso_nome: string;
  nota_infraestrutura: number;
  obs_infraestrutura: string;
  nota_material_didatico: number;
  obs_material_didatico: string;
  criado_em: string;
}

const Dashboard: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await api.get('/evaluations');
        setEvaluations(response.data);
      } catch (error) {
        showNotification('Erro ao carregar suas avaliações.', 'error');
      }
    };

    fetchEvaluations();
  }, [showNotification]);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Minhas Avaliações</h1>
        <Link to="/nova-avaliacao" className="new-evaluation-btn">
          Nova Avaliação
        </Link>
      </header>

      <div className="evaluations-list">
        {evaluations.length > 0 ? (
          evaluations.map((evaluation) => (
            <div key={evaluation.id} className="evaluation-card">
              <div className="card-header">
                <h3>{evaluation.instituicao_nome}</h3>
                <span>
                  Curso: {evaluation.curso_nome} | Feita em: {new Date(evaluation.criado_em).toLocaleDateString()}
                </span>
              </div>
              <div className="card-body">
                <div className="card-notes">
                  <h4>Notas</h4>
                  <p>Infraestrutura: <span className="note">{evaluation.nota_infraestrutura}/5</span></p>
                  <p>Material Didático: <span className="note">{evaluation.nota_material_didatico}/5</span></p>
                </div>
                <div className="card-observations">
                  <h4>Observações</h4>
                  <p><strong>Infraestrutura:</strong> {evaluation.obs_infraestrutura || 'N/A'}</p>
                  <p><strong>Material Didático:</strong> {evaluation.obs_material_didatico || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-evaluations">
            <p>Você ainda não fez nenhuma avaliação.</p>
            <p>Clique em "Nova Avaliação" para começar!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
