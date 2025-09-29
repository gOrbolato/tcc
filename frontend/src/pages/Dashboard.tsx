import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

interface Evaluation {
  id: number;
  instituicao_nome: string;
  curso_nome: string;
  media_final: number;
  criado_em: string;
}

const Dashboard: React.FC = () => {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchEvaluations = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/avaliacoes/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setEvaluations(data);
        } else {
          showNotification(data.message || 'Erro ao carregar avaliações.', 'error');
        }
      } catch (err) {
        showNotification('Ocorreu um erro ao carregar as avaliações.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [navigate, showNotification]);

  if (loading) return <p>Carregando avaliações...</p>;

  return (
    <div>
      <header>
        <span>Aluno(a)-12345</span>
        <nav>
          <ul>
            <li>
              <Link to="/perfil">Perfil</Link>
            </li>
            <li>
              <Link to="/">Sair</Link>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <Link to="/avaliacao">
          <button>Fazer Avaliação</button>
        </Link>
        <section>
          <h2>Últimas Avaliações</h2>
          {evaluations.length === 0 ? (
            <p>Nenhuma avaliação encontrada.</p>
          ) : (
            evaluations.map((evalItem) => (
              <div key={evalItem.id}>
                <p>Data: {new Date(evalItem.criado_em).toLocaleDateString()}</p>
                <p>Instituição: {evalItem.instituicao_nome}</p>
                <p>Média Final: {evalItem.media_final.toFixed(2)}</p>
                <button>Ver Detalhes</button>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
};
export default Dashboard;
