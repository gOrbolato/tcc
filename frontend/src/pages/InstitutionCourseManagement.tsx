import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

interface Institution {
  id: number;
  nome: string;
}

interface Course {
  id: number;
  nome: string;
  instituicao_id: number;
  instituicao_nome?: string; // Para exibir o nome da instituição
}

const InstitutionCourseManagement: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [newInstitutionName, setNewInstitutionName] = useState<string>('');
  const [newCourseName, setNewCourseName] = useState<string>('');
  const [newCourseInstitutionId, setNewCourseInstitutionId] = useState<number | string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const [institutionsRes, coursesRes] = await Promise.all([
        fetch('/api/institutions', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      const institutionsData = await institutionsRes.json();
      const coursesData = await coursesRes.json();

      if (institutionsRes.ok) {
        setInstitutions(institutionsData);
      } else {
        showNotification(institutionsData.message || 'Erro ao carregar instituições.', 'error');
      }

      if (coursesRes.ok) {
        setCourses(coursesData);
      } else {
        showNotification(coursesData.message || 'Erro ao carregar cursos.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao carregar dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [navigate, showNotification]);

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }

    try {
      const response = await fetch('/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome: newInstitutionName }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('Instituição criada com sucesso!', 'success');
        setNewInstitutionName('');
        fetchData();
      } else {
        showNotification(data.message || 'Erro ao criar instituição.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao criar instituição.', 'error');
    }
  };

  const handleDeleteInstitution = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta instituição? Isso também excluirá os cursos associados.')) return;
    if (!token) { navigate('/login'); return; }

    try {
      const response = await fetch(`/api/institutions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('Instituição excluída com sucesso!', 'success');
        fetchData();
      } else {
        showNotification(data.message || 'Erro ao excluir instituição.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao excluir instituição.', 'error');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nome: newCourseName, instituicao_id: Number(newCourseInstitutionId) }),
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('Curso criado com sucesso!', 'success');
        setNewCourseName('');
        setNewCourseInstitutionId('');
        fetchData();
      } else {
        showNotification(data.message || 'Erro ao criar curso.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao criar curso.', 'error');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este curso?')) return;
    if (!token) { navigate('/login'); return; }

    try {
      const response = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('Curso excluído com sucesso!', 'success');
        fetchData();
      } else {
        showNotification(data.message || 'Erro ao excluir curso.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao excluir curso.', 'error');
    }
  };

  if (loading) return <p>Carregando dados...</p>;

  return (
    <div>
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
          <table>
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
                  <td>
                    {/* Implementar edição futuramente */}
                    <button onClick={() => handleDeleteInstitution(inst.id)}>Excluir</button>
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
          <table>
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
                  <td>{course.instituicao_nome}</td>
                  <td>
                    {/* Implementar edição futuramente */}
                    <button onClick={() => handleDeleteCourse(course.id)}>Excluir</button>
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
