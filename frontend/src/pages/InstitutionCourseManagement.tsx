import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api';
import '../assets/styles/Admin.css';

// --- Interfaces ---
interface Institution {
  id: number;
  nome: string;
}
interface Course {
  id: number;
  nome: string;
  instituicao_id: number;
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
  const [loading, setLoading] = useState(true);
  const [instFilter, setInstFilter] = useState('');
  
  // Controla a visão (lista de instituições ou detalhes de uma)
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);

  // Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [newName, setNewName] = useState('');

  const { showNotification } = useNotification();
  // ------------------

  // --- Lógica de Dados ---
  const fetchInstitutions = async () => {
    setLoading(true);
    try {
      const instRes = await api.get('/institutions');
      setInstitutions(instRes.data);
    } catch (err) { showNotification('Erro ao carregar instituições.', 'error'); }
    finally { setLoading(false); }
  };

  // Busca instituições na montagem inicial
  useEffect(() => { fetchInstitutions(); }, [showNotification]);

  // Busca os cursos APENAS quando uma instituição é selecionada
  useEffect(() => {
    if (selectedInstitution) {
      const fetchCoursesForInstitution = async () => {
        try {
          const courseRes = await api.get(`/institutions/${selectedInstitution.id}/courses`);
          setCourses(courseRes.data);
        } catch (err) { showNotification('Erro ao carregar cursos.', 'error'); }
      };
      fetchCoursesForInstitution();
    }
  }, [selectedInstitution, showNotification]);

  const filteredInstitutions = useMemo(() => 
    institutions.filter(i => i.nome.toLowerCase().includes(instFilter.toLowerCase())),
    [institutions, instFilter]
  );
  // ------------------

  // --- Handlers ---
  const handleSelectInstitution = (institution: Institution) => {
    setSelectedInstitution(institution);
  };

  const handleBackToList = () => {
    setSelectedInstitution(null);
    setCourses([]); // Limpa a lista de cursos ao voltar
  };

  const openEditModal = (item: {id: number, nome: string}, type: 'institution' | 'course') => {
    setEditingItem({ ...item, type });
    setNewName(item.nome);
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    const isInstitution = editingItem.type === 'institution';
    const endpoint = isInstitution ? `/institutions/${editingItem.id}` : `/courses/${editingItem.id}`;
    try {
      await api.put(endpoint, { nome: newName });
      showNotification(`${isInstitution ? 'Instituição' : 'Curso'} atualizado com sucesso!`, 'success');
      setIsModalOpen(false);
      // Re-busca os dados relevantes
      if (isInstitution) {
        fetchInstitutions();
        handleBackToList(); // Volta para a lista principal se o nome da instituição mudou
      } else {
        const courseRes = await api.get(`/institutions/${selectedInstitution!.id}/courses`);
        setCourses(courseRes.data);
      }
    } catch (err) { showNotification('Erro ao atualizar.', 'error'); }
  };

  const handleDeleteInstitution = async (id: number) => {
    if (window.confirm('Tem certeza? Isso excluirá a instituição e TODOS os seus cursos.')) {
      try {
        await api.delete(`/institutions/${id}`);
        showNotification('Instituição excluída com sucesso!', 'success');
        handleBackToList();
        fetchInstitutions();
      } catch (err) { showNotification('Erro ao excluir. Verifique as dependências.', 'error'); }
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (window.confirm('Tem certeza?')) {
      try {
        await api.delete(`/courses/${id}`);
        showNotification('Curso excluído com sucesso!', 'success');
        const courseRes = await api.get(`/institutions/${selectedInstitution!.id}/courses`);
        setCourses(courseRes.data);
      } catch (err) { showNotification('Erro ao excluir curso.', 'error'); }
    }
  };
  // ------------------

  // --- Renderização ---
  if (loading && !selectedInstitution) return <div className="admin-container"><p>Carregando...</p></div>;

  // Visão de Detalhes da Instituição
  if (selectedInstitution) {
    return (
      <div className="admin-container">
        <button onClick={handleBackToList} className="admin-back-link" style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer'}}>← Voltar para a lista</button>
        <header className="admin-header">
          <h1>{selectedInstitution.nome}</h1>
          <p>Gerencie os detalhes da instituição e seus cursos.</p>
          <div className="action-buttons" style={{marginTop: '1rem'}}>
            <button onClick={() => openEditModal(selectedInstitution, 'institution')} className="edit-btn">Editar Nome da Instituição</button>
            <button onClick={() => handleDeleteInstitution(selectedInstitution.id)} className="delete-btn">Excluir Instituição</button>
          </div>
        </header>
        <div className="admin-section">
          <h2>Cursos Cadastrados</h2>
          <table className="management-table">
            <thead><tr><th>ID</th><th>Nome do Curso</th><th>Ações</th></tr></thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.nome}</td>
                  <td className="action-buttons">
                    <button onClick={() => openEditModal(course, 'course')} className="edit-btn">Editar</button>
                    <button onClick={() => handleDeleteCourse(course.id)} className="delete-btn">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* ... (Modal de Edição) ... */}
      </div>
    );
  }

  // Visão Principal (Lista de Instituições)
  return (
    <div className="admin-container">
      <Link to="/admin/dashboard" className="admin-back-link">← Voltar ao Painel</Link>
      <header className="admin-header">
        <h1>Gerenciar Instituições e Cursos</h1>
        <p>Selecione uma instituição para ver e gerenciar seus cursos.</p>
      </header>
      <div className="admin-section">
        <h2>Instituições</h2>
        <div className="admin-form">
          <input type="text" placeholder="Buscar instituição por nome..." value={instFilter} onChange={e => setInstFilter(e.target.value)} />
        </div>
        <table className="management-table">
          <thead><tr><th>ID</th><th>Nome</th><th>Ações</th></tr></thead>
          <tbody>
            {filteredInstitutions.map(inst => (
              <tr key={inst.id}>
                <td>{inst.id}</td>
                <td>{inst.nome}</td>
                <td className="action-buttons">
                  <button onClick={() => handleSelectInstitution(inst)} className="edit-btn">Ver Cursos</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ... (Modal de Edição) ... */}
    </div>
  );
};

export default InstitutionCourseManagement;