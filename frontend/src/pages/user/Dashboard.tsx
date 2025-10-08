import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext'; // Importa o useAuth
import '../../assets/styles/Dashboard.css';

// ... (Interface Evaluation)

const Dashboard: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const { showNotification } = useNotification();
  const { logout } = useAuth(); // Pega a função de logout
  const navigate = useNavigate(); // Hook para redirecionamento

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const response = await api.get('/my-evaluations');
        setEvaluations(response.data);
      } catch (error) {
        showNotification('Erro ao carregar suas avaliações.', 'error');
      }
    };
    fetchEvaluations();
  }, [showNotification]);

  const handleLogout = () => {
    logout();
    navigate('/'); // Redireciona para a home após sair
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Minhas Avaliações</h1>
        <div className="dashboard-actions">
          <Link to="/nova-avaliacao" className="new-evaluation-btn">Nova Avaliação</Link>
          <Link to="/perfil" className="secondary-btn">Configurações</Link>
          <button onClick={handleLogout} className="logout-btn-user">Sair</button>
        </div>
      </header>

      <div className="evaluations-list">
        {evaluations.length > 0 ? (
          evaluations.map((evaluation) => (
            <div key={evaluation.id} className="evaluation-card">
              {/* ... (conteúdo do card) ... */}
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