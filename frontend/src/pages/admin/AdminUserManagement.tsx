import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Admin.css'; // Importando o CSS do admin

interface User {
  id: number;
  nome: string;
  email: string;
  ra: string;
}

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users');
        setUsers(response.data);
      } catch (error) {
        addNotification('Erro ao carregar usuários.', 'error');
      }
    };
    fetchUsers();
  }, [addNotification]);

  const handleDelete = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
        addNotification('Usuário excluído com sucesso!', 'success');
      } catch (error) {
        addNotification('Erro ao excluir usuário.', 'error');
      }
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Gerenciar Usuários</h1>
        <p>Visualize, edite ou remova usuários cadastrados no sistema.</p>
      </header>

      <table className="management-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>RA</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.nome}</td>
              <td>{user.email}</td>
              <td>{user.ra}</td>
              <td className="action-buttons">
                <button className="edit-btn">Editar</button>
                <button onClick={() => handleDelete(user.id)} className="delete-btn">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagement;