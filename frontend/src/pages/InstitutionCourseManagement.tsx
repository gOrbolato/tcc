import React, { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import api from '../services/api'; // Usando a instância do Axios
import '../assets/styles/Admin.css'; // Reutilizando o CSS do admin para consistência

interface Institution {
  id: number;
  nome: string;
}

interface Course {
  id: number;
  nome: string;
  instituicao_id: number;
  instituicao_nome?: string;
}

const InstitutionCourseManagement: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newInstitutionName, setNewInstitutionName] = useState<string>('');
  const [newCourseName, setNewCourseName] = useState<string>('');
  const [newCourseInstitutionId, setNewCourseInstitutionId] = useState<number | string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const { showNotification } = useNotification(); // Corrigido de addNotification

  const fetchData = async () => {
    setLoading(true);
    try {
      const [institutionsRes, coursesRes] = await Promise.all([
        api.get('/institutions'),
        api.get('/courses'),
      ]);

      setInstitutions(institutionsRes.data);
      setCourses(coursesRes.data);

    } catch (err) {
      showNotification('Ocorreu um erro ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/institutions', { nome: newInstitutionName });
      showNotification('Instituição criada com sucesso!', 'success');
      setNewInstitutionName('');
      fetchData(); // Re-fetch para atualizar a lista
    } catch (err) {
      showNotification('Erro ao criar instituição.', 'error');
    }
  };

  const handleDeleteInstitution = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta instituição? Isso também excluirá os cursos associados.')) return;
    try {
      await api.delete(`/institutions/${id}`);
      showNotification('Instituição excluída com sucesso!', 'success');
      fetchData();
    } catch (err) {
      showNotification('Erro ao excluir instituição.', 'error');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', { nome: newCourseName, instituicao_id: Number(newCourseInstitutionId) });
      showNotification('Curso criado com sucesso!', 'success');
      setNewCourseName('');
      setNewCourseInstitutionId('');
      fetchData();
    } catch (err) {
      showNotification('Erro ao criar curso.', 'error');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      await api.delete(`/courses/${id}`);
      showNotification('Curso excluído com sucesso!', 'success');
      fetchData();
    } catch (err) {
      showNotification('Erro ao excluir curso.', 'error');
    }
  };

  if (loading) return <p>Carregando dados...</p>;

  return (
    <div className="admin-container"> {/* Usando a classe de container do admin */}
      <h1>Gerenciamento de Instituições e Cursos</h1>

      <section>
        <h2>Instituições</h2>
        <form onSubmit={handleCreateInstitution}>
          <input
            type="text"
            placeholder="Nome da Instituição"
            value={newInstitutionName}
            onChange={(e) => setNewInstitutionName(e.target.value)}
            required
          />
          <button type="submit">Criar Instituição</button>
        </form>
        {institutions.length === 0 ? (
          <p>Nenhuma instituição cadastrada.</p>
        ) : (
          <table className="management-table"> {/* Aplicando a classe da tabela */}
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst) => (
                <tr key={inst.id}>
                  <td>{inst.id}</td>
                  <td>{inst.nome}</td>
                  <td className="action-buttons">
                    <button onClick={() => handleDeleteInstitution(inst.id)} className="delete-btn">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Cursos</h2>
        <form onSubmit={handleCreateCourse}>
          <input
            type="text"
            placeholder="Nome do Curso"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            required
          />
          <select
            value={newCourseInstitutionId}
            onChange={(e) => setNewCourseInstitutionId(e.target.value)}
            required
          >
            <option value="">Selecione a Instituição</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.nome}
              </option>
            ))}
          </select>
          <button type="submit">Criar Curso</button>
        </form>
        {courses.length === 0 ? (
          <p>Nenhum curso cadastrado.</p>
        ) : (
          <table className="management-table"> {/* Aplicando a classe da tabela */}
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Instituição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.nome}</td>
                  <td>{course.instituicao_nome || 'N/A'}</td>
                  <td className="action-buttons">
                    <button onClick={() => handleDeleteCourse(course.id)} className="delete-btn">Excluir</button>
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

export default InstitutionCourseManagement;