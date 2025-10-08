
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../assets/styles/Admin.css';

// --- Interfaces ---
interface User {
  id: number;
  nome: string;
  email: string;
  ra: string;
  instituicao_id: number | null;
  curso_id: number | null;
  is_active: boolean;
}
interface Institution {
  id: number;
  nome: string;
}
interface Course {
  id: number;
  nome: string;
}
// ------------------

const AdminUserManagement: React.FC = () => {
  // --- Estados ---
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos filtros
  const [raFilter, setRaFilter] = useState('');
  const [instFilter, setInstFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');

  // Estados da modal de edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalData, setModalData] = useState({ instId: '', courseId: '', isActive: true });

  const { showNotification } = useNotification();
  // ------------------

  // --- Busca de Dados ---
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (raFilter) params.append('ra', raFilter);
      if (instFilter) params.append('institutionId', instFilter);
      if (courseFilter) params.append('courseId', courseFilter);

      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data);
    } catch (error) {
      showNotification('Erro ao carregar usuários.', 'error');
    } finally {
      setLoading(false);
    }
  }, [raFilter, instFilter, courseFilter, showNotification]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [instRes, courseRes] = await Promise.all([api.get('/institutions'), api.get('/courses')]);
        setInstitutions(instRes.data);
        setCourses(courseRes.data);
      } catch (error) {
        showNotification('Erro ao carregar dados para os filtros.', 'error');
      }
    };
    fetchFilterData();
  }, [showNotification]);
  // ------------------

  // --- Handlers ---
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setModalData({
      instId: user.instituicao_id?.toString() || '',
      courseId: user.curso_id?.toString() || '',
      isActive: user.is_active,
    });
    setIsModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await api.patch(`/admin/users/${editingUser.id}`, {
        instituicao_id: modalData.instId ? Number(modalData.instId) : null,
        curso_id: modalData.courseId ? Number(modalData.courseId) : null,
        is_active: modalData.isActive,
      });
      showNotification('Usuário atualizado com sucesso!', 'success');
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      showNotification('Erro ao atualizar usuário.', 'error');
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        showNotification('Usuário excluído com sucesso!', 'success');
        fetchUsers();
      } catch (error) {
        showNotification('Erro ao excluir usuário.', 'error');
      }
    }
  };
  // ------------------

  return (
    <div className="admin-container">
      <Link to="/admin/dashboard" className="admin-back-link">← Voltar ao Painel</Link>
      <header className="admin-header">
        <h1>Gerenciar Usuários</h1>
        <p>Filtre, visualize e edite o status e afiliação dos usuários.</p>
      </header>

      <div className="admin-section">
        <h2>Filtros</h2>
        <div className="admin-form">
          <input type="text" placeholder="Filtrar por RA..." value={raFilter} onChange={e => setRaFilter(e.target.value)} />
          <select value={instFilter} onChange={e => setInstFilter(e.target.value)}>
            <option value="">Todas as Instituições</option>
            {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
          </select>
          <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)}>
            <option value="">Todos os Cursos</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="admin-section">
        <h2>Resultados</h2>
        {loading ? <p>Carregando usuários...</p> : (
          <table className="management-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>RA</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map(user => (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.ra}</td>
                  <td>{user.is_active ? 'Ativo' : 'Bloqueado'}</td>
                  <td className="action-buttons">
                    <button onClick={() => openEditModal(user)} className="edit-btn">Editar</button>
                    <button onClick={() => handleDelete(user.id)} className="delete-btn">Excluir</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
            <h2>Editando: {editingUser.nome}</h2>
            <div className="form-group">
              <label>Instituição</label>
              <select value={modalData.instId} onChange={e => setModalData({...modalData, instId: e.target.value})}>
                <option value="">Nenhuma</option>
                {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Curso</label>
              <select value={modalData.courseId} onChange={e => setModalData({...modalData, courseId: e.target.value})}>
                <option value="">Nenhum</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status do Usuário</label>
              <button onClick={() => setModalData({...modalData, isActive: !modalData.isActive})} className={modalData.isActive ? 'edit-btn' : 'delete-btn'}>
                {modalData.isActive ? 'ATIVO' : 'BLOQUEADO'}
              </button>
              <p style={{fontSize: '0.8rem', color: '#666'}}>Usuários bloqueados não podem submeter novas avaliações.</p>
            </div>
            <button onClick={handleUpdateUser} style={{width: '100%', marginTop: '1rem'}} className="edit-btn">Salvar Alterações</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;
