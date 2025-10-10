import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../../assets/styles/UserArea.css'; // Novo CSS

interface Notification {
  id: number;
  nome: string;
  ra: string;
  mensagem: string;
  criado_em: string;
}

const AdminDashboard: React.FC = () => {
  const { user, logout, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) return; // Espera a autenticação carregar

    if (user && user.isAdmin) {
      const fetchNotifications = async () => {
        setPageLoading(true);
        try {
          const response = await api.get('/admin/notifications');
          setNotifications(response.data);
        } catch (error) { 
          console.error("Erro ao buscar notificações", error);
          // Tratar erro, talvez redirecionar ou mostrar mensagem
        } finally {
          setPageLoading(false);
        }
      };
      fetchNotifications();
    } else if (!isAuthLoading && !user) {
      // Se não está carregando a autenticação e não tem usuário, redireciona para login
      navigate('/login');
    } else if (!isAuthLoading && user && !user.isAdmin) {
      // Se não é admin, redireciona para o dashboard normal
      navigate('/dashboard');
    }
  }, [isAuthLoading, user, navigate]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) { console.error("Erro ao marcar como lida", error); }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (isAuthLoading || pageLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Painel Administrativo</h1>
        {user && <h2>Bem-vindo(a), {user.nome.split(' ')[0]}!</h2>}
        <div className="page-actions">
          <Link to="/admin/gerenciar-usuarios" className="btn btn-secondary">Gerenciar Usuários</Link>
          <Link to="/admin/gerenciar-instituicoes" className="btn btn-secondary">Gerenciar Instituições</Link>
          <Link to="/admin/visualizar-avaliacoes" className="btn btn-secondary">Visualizar Avaliações</Link>
          <button onClick={handleLogout} className="btn btn-danger">Sair</button>
        </div>

        {notifications.length > 0 && (
          <div className="card">
            <h2>Pedidos de Reativação Pendentes</h2>
            <table className="management-table">
              <thead><tr><th>Usuário</th><th>RA</th><th>Data do Pedido</th><th>Ação</th></tr></thead>
              <tbody>
                {notifications.map(n => (
                  <tr key={n.id}>
                    <td>{n.nome}</td>
                    <td>{n.ra}</td>
                    <td>{new Date(n.criado_em).toLocaleString()}</td>
                    <td className="action-buttons">
                      <Link to="/admin/gerenciar-usuarios" className="btn btn-secondary">Ver Usuário</Link>
                      <button onClick={() => handleMarkAsRead(n.id)} className="btn btn-primary">Marcar como Lido</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {notifications.length === 0 && (
          <div className="card" style={{textAlign: 'center'}}>
            <p>Nenhum pedido de reativação pendente.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminDashboard;