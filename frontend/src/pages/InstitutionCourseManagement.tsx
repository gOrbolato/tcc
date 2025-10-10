import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../assets/styles/UserArea.css';

// --- Interfaces ---
interface Institution {
  id: number;
  nome: string;
  nota_geral?: number | null;
}
interface Course {
  id: number;
  nome: string;
  instituicao_id: number;
  nota_geral?: number | null;
}
interface EditingItem {
  id: number;
  nome: string;
  type: 'institution' | 'course';
}
// ------------------

const InstitutionCourseManagement: React.FC = () => {
  // --- Estados ---
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [instFilter, setInstFilter] = useState(''); // Valor do input de filtro
  const [searchTerm, setSearchTerm] = useState(''); // Termo usado na busca
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [newName, setNewName] = useState('');
  const { showNotification } = useNotification();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  // ------------------

  // --- Lógica de Dados ---
  const fetchInstitutions = useCallback(async () => {
    setPageLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('nome', searchTerm);
      const instRes = await api.get(`/institutions?${params.toString()}`);
      setInstitutions(instRes.data);
      console.log("DEBUG: Instituições carregadas", instRes.data);
    } catch (err) {
      console.error("ERRO: Erro ao carregar instituições no fetchInstitutions", err);
      showNotification('Erro ao carregar instituições.', 'error');
    } finally {
      setPageLoading(false);
      console.log("DEBUG: fetchInstitutions finalizado, pageLoading false");
    }
  }, [searchTerm, showNotification]);

  const fetchCoursesForInstitution = useCallback(async (institutionId: number) => {
    console.log("DEBUG: fetchCoursesForInstitution iniciado para instId:", institutionId);
    setPageLoading(true);
    try {
      const courseRes = await api.get(`/institutions/${institutionId}/courses`);
      setCourses(courseRes.data);
      console.log("DEBUG: Cursos carregados", courseRes.data);
    } catch (err) {
      console.error("ERRO: Erro ao carregar cursos no fetchCoursesForInstitution", err);
      showNotification('Erro ao carregar cursos.', 'error');
    } finally {
      setPageLoading(false);
      console.log("DEBUG: fetchCoursesForInstitution finalizado, pageLoading false");
    }
  }, [showNotification]);

  useEffect(() => {
    if (isAuthLoading) return; 

    if (!user || !user.isAdmin) {
      navigate('/login'); 
      return;
    }

    if (!selectedInstitution) {
      // Só busca instituições se um termo de busca foi aplicado
      if (searchTerm) {
        fetchInstitutions();
      } else {
        setPageLoading(false); // Se não tem termo de busca, não está carregando
      }
    } else {
      fetchCoursesForInstitution(selectedInstitution.id);
    }
  }, [isAuthLoading, user, selectedInstitution, searchTerm, fetchInstitutions, fetchCoursesForInstitution, navigate]);

  const filteredInstitutions = useMemo(() => 
    institutions.filter(i => i.nome.toLowerCase().includes(searchTerm.toLowerCase())),
    [institutions, searchTerm]
  );
  // ------------------

  // --- Handlers ---
  const handleSearch = () => { setSearchTerm(instFilter); }; // Inicia a busca com o valor do input
  const handleClearSearch = () => { setInstFilter(''); setSearchTerm(''); setInstitutions([]); setCourses([]); setPageLoading(false); };
  const handleSelectInstitution = (institution: Institution) => { setSelectedInstitution(institution); };
  const handleBackToList = () => { setSelectedInstitution(null); setCourses([]); };

  const openEditModal = (item: {id: number, nome: string}, type: 'institution' | 'course') => {
    setEditingItem({ ...item, type });
    setNewName(item.nome);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    if (window.confirm(`Tem certeza que deseja alterar o nome de "${editingItem.nome}" para "${newName}"?`)) {
      const isInstitution = editingItem.type === 'institution';
      const endpoint = isInstitution ? `/institutions/${editingItem.id}` : `/courses/${editingItem.id}`;
      try {
        await api.put(endpoint, { nome: newName });
        showNotification(`${isInstitution ? 'Instituição' : 'Curso'} atualizado com sucesso!`, 'success');
        setIsModalOpen(false);
        if (isInstitution) {
          fetchInstitutions();
        } else if (selectedInstitution) {
          fetchCoursesForInstitution(selectedInstitution.id);
        }
      } catch (err) { showNotification('Erro ao atualizar.', 'error'); }
    }
  };

  const handleDeleteInstitution = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta instituição? A ação não pode ser desfeita.')) {
      try {
        await api.delete(`/institutions/${id}`);
        showNotification('Instituição excluída com sucesso!', 'success');
        handleBackToList();
      } catch (err) { showNotification('Erro ao excluir. Verifique se não há cursos associados a ela.', 'error'); }
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este curso?')) {
      try {
        await api.delete(`/courses/${id}`);
        showNotification('Curso excluído com sucesso!', 'success');
        if (selectedInstitution) {
          fetchCoursesForInstitution(selectedInstitution.id);
        }
      } catch (err) { showNotification('Erro ao excluir curso.', 'error'); }
    }
  };
  // ------------------

  // --- Renderização ---
  if (isAuthLoading || pageLoading) {
    return <section className="page-section"><div className="section-content"><p>Carregando...</p></div></section>;
  }

  if (!user || !user.isAdmin) {
    return <section className="page-section"><div className="section-content"><p>Acesso negado. Você não tem permissão de administrador.</p></div></section>;
  }

  // Visão de Detalhes da Instituição
  if (selectedInstitution) {
    return (
      <section className="page-section">
        <div className="section-content">
          <h1>{selectedInstitution.nome}</h1>
          <div className="page-actions">
            <button onClick={handleBackToList} className="btn btn-secondary">← Voltar para Instituições</button>
            <button onClick={() => openEditModal(selectedInstitution, 'institution')} className="btn btn-primary">Editar Instituição</button>
            <button onClick={() => handleDeleteInstitution(selectedInstitution.id)} className="btn btn-danger">Excluir Instituição</button>
          </div>

          <div className="card">
            <h2>Cursos Cadastrados</h2>
            <table className="management-table">
              <thead><tr><th>ID</th><th>Nome do Curso</th><th>Nota Geral</th><th>Ações</th></tr></thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>{course.id}</td>
                    <td>{course.nome}</td>
                    <td>{course.nota_geral ? Number(course.nota_geral).toFixed(2) : 'N/A'}</td>
                    <td className="action-buttons" style={{textAlign: 'right'}}>
                      <button onClick={() => openEditModal(course, 'course')} className="btn btn-secondary">Editar</button>
                      <button onClick={() => handleDeleteCourse(course.id)} className="btn btn-danger" style={{marginLeft: '0.5rem'}}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && editingItem && (
          <div className="modal-backdrop">
            <div className="modal-content card">
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
              <h2>{`Editando ${editingItem.type === 'institution' ? 'Instituição' : 'Curso'}: ${editingItem.nome}`}</h2>
              <div className="form-group">
                <label>Novo Nome</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="form-control"/>
              </div>
              <button onClick={handleUpdate} className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>Salvar Alterações</button>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Visão Principal (Lista de Instituições)
  return (
    <section className="page-section">
      <div className="section-content">
        <h1>Gerenciar Instituições e Cursos</h1>
        <div className="page-actions">
          <Link to="/admin/dashboard" className="btn btn-secondary">← Voltar ao Painel</Link>
        </div>

          <div className="card">
            <h2>Instituições</h2>
            <div className="search-controls">
              <input type="text" placeholder="Buscar instituição por nome..." value={instFilter} onChange={e => setInstFilter(e.target.value)} className="form-control search-input"/>
              <button type="button" onClick={handleSearch} className="btn btn-primary">Buscar</button>
              <button type="button" onClick={handleClearSearch} className="btn btn-secondary">Limpar</button>
            </div>
          
          {searchTerm ? (
            filteredInstitutions.length > 0 ? (
              <table className="management-table">
                <thead><tr><th>ID</th><th>Nome</th><th>Nota Geral</th><th>Ações</th></tr></thead>
                <tbody>
                  {filteredInstitutions.map(inst => (
                    <tr key={inst.id}>
                      <td>{inst.id}</td>
                      <td>{inst.nome}</td>
                      <td>{inst.nota_geral ? Number(inst.nota_geral).toFixed(2) : 'N/A'}</td>
                      <td className="action-buttons" style={{textAlign: 'right'}}>
                        <button onClick={() => handleSelectInstitution(inst)} className="btn btn-primary">Ver Cursos</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{textAlign: 'center', marginTop: '1rem'}}>Nenhuma instituição encontrada para "{searchTerm}".</p>
            )
          ) : (
            <p style={{textAlign: 'center', marginTop: '1rem'}}>Use a busca para encontrar instituições.</p>
          )}
        </div>

        {isModalOpen && editingItem && (
          <div className="modal-backdrop">
            <div className="modal-content card">
              <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">&times;</button>
              <h2>{`Editando ${editingItem.type === 'institution' ? 'Instituição' : 'Curso'}: ${editingItem.nome}`}</h2>
              <div className="form-group">
                <label>Novo Nome</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="form-control"/>
              </div>
              <button onClick={handleUpdate} className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>Salvar Alterações</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default InstitutionCourseManagement;
