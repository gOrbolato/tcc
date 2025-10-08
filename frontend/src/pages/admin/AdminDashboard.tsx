import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/Admin.css';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-header-title">
          <h1>Painel do Administrador</h1>
          {user && <p>Bem-vindo(a), {user.nome}!</p>}
        </div>
        <button onClick={handleLogout} className="logout-btn">Sair</button>
      </header>

      <nav className="admin-nav">
        <Link to="/admin/gerenciar-usuarios" className="admin-nav-item">
          <h2>Gerenciar Usuários</h2>
          <p>Filtre, visualize e edite o status e afiliação dos usuários.</p>
        </Link>
        
        <Link to="/admin/gerenciar-instituicoes" className="admin-nav-item">
          <h2>Gerenciar Instituições e Cursos</h2>
          {/* O texto foi alterado nesta linha */}
          <p>Edite ou remova instituições e cursos existentes na plataforma.</p>
        </Link>
        
        <Link to="/admin/visualizar-avaliacoes" className="admin-nav-item">
          <h2>Visualizar Avaliações</h2>
          <p>Acesse e filtre todas as avaliações enviadas pelos alunos.</p>
        </Link>
      </nav>
    </div>
  );
};

export default AdminDashboard;