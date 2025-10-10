import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/UserArea.css';

interface Evaluation { id: number; media_final: string; criado_em: string; instituicao_nome: string; curso_nome: string; }

const Dashboard: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [isCooldownActive, setIsCooldownActive] = useState(false);
  const [cooldownDays, setCooldownDays] = useState(0);
  const { showNotification } = useNotification();
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading) return; // Espera a autenticação carregar

    if (user) {
      const fetchEvaluations = async () => {
        setPageLoading(true);
        try {
          const response = await api.get('/my-evaluations');
          const userEvaluations = response.data || [];
          setEvaluations(userEvaluations);
          if (userEvaluations.length > 0) {
            const lastEvalDate = new Date(userEvaluations[0].criado_em);
            const cooldownEndDate = new Date(lastEvalDate);
            cooldownEndDate.setDate(cooldownEndDate.getDate() + 60);
            const timeLeft = cooldownEndDate.getTime() - new Date().getTime();
            if (timeLeft > 0) {
              setIsCooldownActive(true);
              setCooldownDays(Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));
            } else {
              setIsCooldownActive(false);
            }
          } else {
            setIsCooldownActive(false);
          }
        } catch (error) {
          showNotification('Erro ao carregar suas avaliações.', 'error');
        } finally {
          setPageLoading(false);
        }
      };
      fetchEvaluations();
    } else {
      setPageLoading(false);
    }
  }, [isAuthLoading, user, showNotification]);

  const handleLogout = () => { logout(); navigate('/'); };
  const handleNewEvaluationClick = () => { if (!isCooldownActive) navigate('/nova-avaliacao'); };

  if (isAuthLoading || pageLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Minhas Avaliações</h1>
        <div className="page-actions">
          {user?.is_active && <button onClick={handleNewEvaluationClick} className="btn btn-primary" disabled={isCooldownActive} title={isCooldownActive ? `Próxima avaliação em ${cooldownDays} dia(s)` : 'Fazer uma nova avaliação'}>Nova Avaliação</button>}
          <Link to="/perfil" className="btn btn-secondary">Configurações</Link>
          <button onClick={handleLogout} className="btn btn-danger">Sair</button>
        </div>
        {isCooldownActive && <div className="card" style={{textAlign: 'center'}}><h2>Próxima avaliação em {cooldownDays} {cooldownDays === 1 ? 'dia' : 'dias'}</h2></div>}
        {evaluations.length > 0 ? (
          evaluations.map(evaluation => (
            <div key={evaluation.id} className="card">
              <h3>{evaluation.instituicao_nome} - {evaluation.curso_nome}</h3>
              <div className="evaluation-card-body">
                <p><strong>Média Final:</strong> {evaluation.media_final}</p>
                <Link to={`/avaliacao/${evaluation.id}`} className="btn btn-secondary">Ver Detalhes</Link>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{textAlign: 'center'}}><p>Ainda não há nenhuma avaliação.</p></div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;
