import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import '../../assets/styles/UserArea.css'; // Novo CSS

// --- Interfaces ---
interface User { id: number; nome: string; email: string; ra: string; instituicao_id: number | null; curso_id: number | null; is_active: boolean; }
interface Institution { id: number; nome: string; }
interface Course { id: number; nome: string; }
// ------------------

const AdminUserManagement: React.FC = () => {
  // --- Estados ---
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [instFilter, setInstFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [raFilter, setRaFilter] = useState('');
  const [activeFilters, setActiveFilters] = useState({ ra: '', inst: '', course: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalData, setModalData] = useState({ instId: '', courseId: '', isActive: true });
  const { showNotification } = useNotification();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  // ------------------

  // --- Lógica de Dados ---
  const fetchUsers = useCallback(async () => {
    console.log("DEBUG AdminUserManagement: fetchUsers iniciado com activeFilters:", activeFilters);
    setPageLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeFilters.ra) params.append('ra', activeFilters.ra);
      if (activeFilters.inst) params.append('institutionId', activeFilters.inst);
      if (activeFilters.course) params.append('courseId', activeFilters.course);
      const response = await api.get(`/admin/users?${params.toString()}`);
      setUsers(response.data);
      console.log("DEBUG AdminUserManagement: Usuários carregados:", response.data);
    } catch (error) { 
      console.error("ERRO AdminUserManagement: Erro ao carregar usuários", error);
      showNotification('Erro ao carregar usuários.', 'error'); 
    }
    finally { 
      setPageLoading(false);
      console.log("DEBUG AdminUserManagement: fetchUsers finalizado, pageLoading false.");
    }
  }, [activeFilters, showNotification]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const [instRes, courseRes] = await Promise.all([api.get('/institutions'), api.get('/courses')]);
      setInstitutions(instRes.data);
      setCourses(courseRes.data);
      console.log("DEBUG AdminUserManagement: Opções de filtro carregadas.");
    } catch (error) {
      console.error("ERRO AdminUserManagement: Erro ao carregar dados para os filtros", error);
      showNotification('Erro ao carregar dados para os filtros.', 'error');
    }
  }, [showNotification]);

  useEffect(() => {
    console.log("DEBUG AdminUserManagement: useEffect executado. isAuthLoading:", isAuthLoading, "user:", user, "hasSearched:", hasSearched);
    if (isAuthLoading) return; 

    if (!user || !user.isAdmin) {
      navigate('/login'); 
      return;
    }

    fetchFilterOptions(); 

    if (hasSearched) {
      console.log("DEBUG AdminUserManagement: hasSearched é true, chamando fetchUsers.");
      fetchUsers();
    } else {
      console.log("DEBUG AdminUserManagement: hasSearched é false, setando pageLoading para false.");
      setPageLoading(false); 
    }
  }, [isAuthLoading, user, hasSearched, fetchUsers, fetchFilterOptions, navigate]);
  // ------------------

  // --- Handlers ---
  const handleSearch = () => { 
    console.log("DEBUG AdminUserManagement: handleSearch acionado. raFilter:", raFilter, "instFilter:", instFilter, "courseFilter:", courseFilter);
    setHasSearched(true); 
    setActiveFilters({ ra: raFilter, inst: instFilter, course: courseFilter }); 
  };
  const handleClearFilters = () => { 
    console.log("DEBUG AdminUserManagement: handleClearFilters acionado.");
    setRaFilter(''); setInstFilter(''); setCourseFilter(''); 
    setActiveFilters({ ra: '', inst: '', course: '' }); 
    setHasSearched(false); 
    setUsers([]); 
  };
  const openEditModal = (user: User) => { setEditingUser(user); setModalData({ instId: user.instituicao_id?.toString() || '', courseId: user.curso_id?.toString() || '', isActive: user.is_active }); setIsModalOpen(true); };
  
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await api.patch(`/admin/users/${editingUser.id}`, { instituicao_id: modalData.instId ? Number(modalData.instId) : null, curso_id: modalData.courseId ? Number(modalData.courseId) : null, is_active: modalData.isActive });
      showNotification('Usuário atualizado com sucesso!', 'success');
      setIsModalOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) { 
      console.error("ERRO AdminUserManagement: Erro ao atualizar usuário", error);
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
        console.error("ERRO AdminUserManagement: Erro ao excluir usuário", error);
        showNotification('Erro ao excluir usuário.', 'error'); 
      }
    }
  };
  // ------------------

  // --- Renderização ---
  console.log("DEBUG AdminUserManagement: Renderizando. isAuthLoading:", isAuthLoading, "pageLoading:", pageLoading);

  if (isAuthLoading || pageLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  if (!user || !user.isAdmin) {
    return <section className="page-section"><div className="section-content"><p>Acesso negado. Você não tem permissão de administrador.</p></div></section>;
  }

  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Gerenciar Usuários</h1>
        <div className="page-actions">
          <Link to="/admin/dashboard" className="btn btn-secondary">← Voltar ao Painel</Link>
        </div>

        <div className="card">
          <h2>Filtros</h2>
          <div className="form-group">
            <label htmlFor="raFilter">RA do Usuário</label>
            <input type="text" id="raFilter" placeholder="Filtrar por RA..." value={raFilter} onChange={e => setRaFilter(e.target.value)} className="form-control"/>
          </div>
          <div className="form-group">
            <label htmlFor="instFilter">Instituição</label>
            <select id="instFilter" value={instFilter} onChange={e => setInstFilter(e.target.value)} className="form-control">
              <option value="">Todas as Instituições</option>
              {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="courseFilter">Curso</label>
            <select id="courseFilter" value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="form-control">
              <option value="">Todos os Cursos</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <button type="button" onClick={handleSearch} className="btn btn-primary">Procurar</button>
          <button type="button" onClick={handleClearFilters} className="btn btn-secondary" style={{marginLeft: '1rem'}}>Limpar Filtros</button>
        </div>

        <div className="card">
          <h2>Resultados</h2>
          {!hasSearched ? (
            <p>Preencha os filtros e clique em "Procurar" para ver os resultados.</p>
          ) : users.length > 0 ? (
            <table className="management-table">
              <thead><tr><th>Nome</th><th>Email</th><th>RA</th><th>Status</th><th>Ações</th></tr></thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.nome}</td>
                    <td>{user.email}</td>
                    <td>{user.ra}</td>
                    <td>{user.is_active ? 'Ativo' : 'Bloqueado'}</td>
                    <td className="action-buttons">
                      <button onClick={() => openEditModal(user)} className="btn btn-secondary">Editar</button>
                      <button onClick={() => handleDelete(user.id)} className="btn btn-danger" style={{marginLeft: '0.5rem'}}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Nenhum usuário encontrado para os filtros selecionados.</p>
          )}
        </div>

        {isModalOpen && editingUser && (
          <div className="modal-backdrop">
            <div className="modal-content card">
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
              <h2>Editando: {editingUser.nome}</h2>
              <div className="form-group">
                <label htmlFor="modalInst">Instituição</label>
                <select id="modalInst" value={modalData.instId} onChange={e => setModalData({...modalData, instId: e.target.value})} className="form-control">
                  <option value="">Nenhuma</option>
                  {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modalCourse">Curso</label>
                <select id="modalCourse" value={modalData.courseId} onChange={e => setModalData({...modalData, courseId: e.target.value})} className="form-control">
                  <option value="">Nenhum</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="modalStatus">Status do Usuário</label>
                <select id="modalStatus" value={modalData.isActive ? '1' : '0'} onChange={e => setModalData({...modalData, isActive: e.target.value === '1'})} className="form-control">
                  <option value="1">Ativo</option>
                  <option value="0">Bloqueado</option>
                </select>
                <p style={{fontSize: '0.8rem', color: '#666', marginTop: '0.5rem'}}>Usuários bloqueados não podem submeter novas avaliações.</p>
              </div>
              <button onClick={handleUpdateUser} className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>Salvar Alterações</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AdminUserManagement;
