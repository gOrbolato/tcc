import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';

interface AdminUser {
  id: number;
  nome: string;
  email: string;
}

const AdminUserManagement: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdmin, setNewAdmin] = useState({ nome: '', email: '', senha: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchAdmins = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAdmins(data);
      } else {
        showNotification(data.message || 'Erro ao carregar administradores.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao carregar administradores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [navigate, showNotification]);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newAdmin),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('Administrador criado com sucesso!', 'success');
        setNewAdmin({ nome: '', email: '', senha: '' });
        fetchAdmins(); // Recarrega a lista
      } else {
        showNotification(data.message || 'Erro ao criar administrador.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao criar administrador.', 'error');
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este administrador?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('Administrador excluído com sucesso!', 'success');
        fetchAdmins(); // Recarrega a lista
      } else {
        showNotification(data.message || 'Erro ao excluir administrador.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao excluir administrador.', 'error');
    }
  };

  if (loading) return <p>Carregando administradores...</p>;

  return (
    <div>
      <h1>Gerenciamento de Administradores</h1>

      <section>
        <h2>Criar Novo Administrador</h2>
        <form onSubmit={handleCreateAdmin}>
          <input
            type="text"
            placeholder="Nome"
            value={newAdmin.nome}
            onChange={(e) => setNewAdmin({ ...newAdmin, nome: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={newAdmin.senha}
            onChange={(e) => setNewAdmin({ ...newAdmin, senha: e.target.value })}
            required
          />
          <button type="submit">Criar Admin</button>
        </form>
      </section>

      <section>
        <h2>Administradores Existentes</h2>
        {admins.length === 0 ? (
          <p>Nenhum administrador cadastrado.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>{admin.id}</td>
                  <td>{admin.nome}</td>
                  <td>{admin.email}</td>
                  <td>
                    {/* Implementar edição futuramente */}
                    <button onClick={() => handleDeleteAdmin(admin.id)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default AdminUserManagement;
