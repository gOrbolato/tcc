import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import '../../assets/styles/UserArea.css';

const questionMap: { [key: string]: string } = {
  nota_infraestrutura: 'Infraestrutura geral',
  nota_coordenacao: 'Coordenação',
  nota_direcao: 'Direção',
  nota_localizacao: 'Localização',
  nota_acessibilidade: 'Acessibilidade',
  nota_equipamentos: 'Equipamentos',
  nota_biblioteca: 'Biblioteca',
  nota_didatica: 'Didática dos professores',
  nota_conteudo: 'Conteúdo das matérias',
  nota_dinamica_professores: 'Dinâmica dos professores',
  nota_disponibilidade_professores: 'Disponibilidade dos professores',
};

const AvaliacaoDetalhes: React.FC = () => {
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/evaluations/${id}`);
        setEvaluation(response.data);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  if (!evaluation) return <section className="page-section"><div className="section-content"><p>Avaliação não encontrada.</p></div></section>;

  const answers = Object.keys(questionMap).map(key => ({
    title: questionMap[key],
    score: evaluation[key],
    observation: evaluation[key.replace('nota_', 'comentario_')]
  }));

  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Detalhes da Avaliação</h1>
        <div className="page-actions">
          <Link to="/dashboard" className="btn btn-secondary">Voltar</Link>
        </div>
        <div className="card">
          <h2>Avaliação de {new Date(evaluation.criado_em).toLocaleDateString()}</h2>
          <p><strong>Média Final:</strong> {Number(evaluation.media_final).toFixed(2)}</p>
          <div className="answers-grid">
            {answers.map(item => (
              item.score && (
                <div key={item.title} className="answer-item">
                  <h4>{item.title}</h4>
                  <p className="score">{item.score}/5</p>
                  {item.observation && <p className="observation">\"{item.observation}\"</p>}
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvaliacaoDetalhes;