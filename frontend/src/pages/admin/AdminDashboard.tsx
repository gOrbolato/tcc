import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
// O caminho correto precisa de mais um '../' para sair da pasta 'admin'
import '../../assets/styles/Admin.css'; 

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Painel do Administrador</h1>
        {user && <p>Bem-vindo(a), {user.nome}!</p>}
      </header>

      <nav className="admin-nav">
        <Link to="/admin/gerenciar-usuarios" className="admin-nav-item">
          <h2>Gerenciar Usuários</h2>
          <p>Adicionar, editar ou remover usuários do sistema.</p>
        </Link>
        
        <Link to="/admin/gerenciar-instituicoes" className="admin-nav-item">
          <h2>Gerenciar Instituições e Cursos</h2>
          <p>Adicionar ou editar instituições de ensino e seus respectivos cursos.</p>
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