import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import Question from '../../components/Question';
import '../../assets/styles/UserArea.css';

interface Answer {
  nota: number;
  obs: string;
}

interface UserInfo {
  instituicao_id: number | null;
  curso_id: number | null;
}

const Avaliacao: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: string]: Answer }>({});
  const [userInfo, setUserInfo] = useState<UserInfo>({ instituicao_id: null, curso_id: null });
  const [pageLoading, setPageLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      const fetchUserInfo = async () => {
        setPageLoading(true);
        try {
          const response = await api.get('/perfil');
          setUserInfo({ instituicao_id: response.data.instituicao_id, curso_id: response.data.curso_id });
        } catch (error) { 
          console.error("ERRO Avaliacao: Erro ao carregar informações do usuário.", error);
          showNotification('Erro ao carregar informações do usuário.', 'error'); 
        }
        finally { setPageLoading(false); }
      };
      fetchUserInfo();
    } else {
      setPageLoading(false);
      navigate('/login'); // Redireciona para login se não houver usuário
    }
  }, [isAuthLoading, user, showNotification, navigate]);

  const questions = {
    institution: [
      { key: 'infraestrutura', title: 'Infraestrutura geral (salas, laboratórios, etc.)' },
      { key: 'coordenacao', title: 'Acessibilidade e prestatividade da Coordenação' },
      { key: 'direcao', title: 'Acessibilidade e prestatividade da Direção' },
      { key: 'localizacao', title: 'Localização e facilidade de acesso à instituição' },
      { key: 'acessibilidade', title: 'Acessibilidade para pessoas com deficiência' },
      { key: 'equipamentos', title: 'Qualidade e modernidade dos equipamentos' },
      { key: 'biblioteca', title: 'Qualidade do acervo da biblioteca' },
    ],
    course: [
      { key: 'didatica', title: 'Didática e clareza dos professores' },
      { key: 'conteudo', title: 'Relevância e atualização do conteúdo das matérias' },
      { key: 'dinamica_professores', title: 'Dinamismo dos professores na aplicação das matérias' },
      { key: 'disponibilidade_professores', title: 'Disponibilidade dos professores para tirar dúvidas' },
    ],
  };

  const handleAnswerChange = (key: string, answer: Answer) => {
    setAnswers(prev => ({ ...prev, [key]: answer }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const allQuestions = [...questions.institution, ...questions.course];

    // Validação detalhada
    for (const question of allQuestions) {
      const answer = answers[question.key];
      if (!answer || !answer.nota || answer.nota === 0) {
        showNotification(`Por favor, dê uma nota para a pergunta: "${question.title}"`, 'error');
        return;
      }
      if (!answer.obs || answer.obs.trim() === '') {
        showNotification(`Por favor, escreva uma observação para a pergunta: "${question.title}"`, 'error');
        return;
      }
    }

    try {
      const apiData = Object.keys(answers).reduce((acc: { [key: string]: number | string }, key) => {
        const answer = answers[key];
        if (answer) {
          acc[`nota_${key}`] = answer.nota;
          acc[`comentario_${key}`] = answer.obs;
        }
        return acc;
      }, {});

      await api.post('/evaluations', { ...apiData, instituicao_id: userInfo.instituicao_id, curso_id: userInfo.curso_id });
      showNotification('Avaliação enviada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (error: any) { 
      console.error("ERRO Avaliacao: Erro ao enviar avaliação.", error);
      showNotification(error.response?.data?.message || 'Erro ao enviar avaliação.', 'error'); 
    }
  };

  if (isAuthLoading || pageLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Nova Avaliação</h1>
        <div className="page-actions">
          <Link to="/dashboard" className="btn btn-secondary">Cancelar</Link>
        </div>

        <div className="card" style={{textAlign: 'left'}}>
          <h2>Aviso Importante</h2>
          <p>Após o envio, sua avaliação <strong>não poderá ser editada no prazo de 60 dias</strong>. Você só poderá enviar uma nova avaliação daqui a <strong>60 dias</strong>. Responda com atenção e honestidade.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <h2>Avaliação da Instituição</h2>
            {questions.institution.map(q => <Question key={q.key} title={q.title} onAnswerChange={(answer: Answer) => handleAnswerChange(q.key, answer)} />)}
          </div>

          <div className="card">
            <h2>Avaliação do Curso</h2>
            {questions.course.map(q => <Question key={q.key} title={q.title} onAnswerChange={(answer: Answer) => handleAnswerChange(q.key, answer)} />)}
          </div>
          
          <button type="submit" className="btn btn-primary" style={{width: '100%', fontSize: '1.2rem', padding: '1rem'}}>
            Enviar Avaliação
          </button>
        </form>
      </div>
    </section>
  );
};

export default Avaliacao;