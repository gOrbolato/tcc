import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import Question from '../../components/Question';
import '../../assets/styles/UserArea.css';

interface Answer { nota: number; obs: string; }

const Avaliacao: React.FC = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  // ... (outros estados e lógica)

  useEffect(() => {
    if (isAuthLoading) return;
    if (user) {
      // ... (lógica para buscar userInfo)
      setPageLoading(false);
    } else {
      setPageLoading(false);
    }
  }, [isAuthLoading, user]);

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
        <div className="card">
          <h2>Aviso Importante</h2>
          <p>Após o envio, sua avaliação não poderá ser editada.</p>
        </div>
        <form>
          <div className="card">
            <h2>Avaliação da Instituição</h2>
            {/* ... (map das questões) ... */}
          </div>
          <div className="card">
            <h2>Avaliação do Curso</h2>
            {/* ... (map das questões) ... */}
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Enviar Avaliação</button>
        </form>
      </div>
    </section>
  );
};

export default Avaliacao;
