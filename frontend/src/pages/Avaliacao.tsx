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
}

const Avaliacao: React.FC = () => {
  const [instituicaoId, setInstituicaoId] = useState<string>('');
  const [cursoId, setCursoId] = useState<string>('');
  const [nota_infraestrutura, setNotaInfraestrutura] = useState<number>(0);
  const [obs_infraestrutura, setObsInfraestrutura] = useState<string>('');
  const [nota_material_didatico, setNotaMaterialDidatico] = useState<number>(0);
  const [obs_material_didatico, setObsMaterialDidatico] = useState<string>('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchInstitutionsAndCourses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Você precisa estar logado para fazer uma avaliação.', 'error');
        navigate('/login');
        return;
      }

      try {
        const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
        const [institutionsRes, coursesRes] = await Promise.all([
          fetch('/api/institutions', { headers }),
          fetch('/api/courses', { headers }),
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
        showNotification('Ocorreu um erro ao carregar instituições e cursos.', 'error');
      }
    };
    fetchInstitutionsAndCourses();
  }, [navigate, showNotification]);

  useEffect(() => {
    if (instituicaoId) {
      setFilteredCourses(courses.filter(course => course.instituicao_id === Number(instituicaoId)));
    } else {
      setFilteredCourses([]);
    }
    setCursoId(''); // Resetar curso ao mudar instituição
  }, [instituicaoId, courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Você precisa estar logado para enviar uma avaliação.', 'error');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          instituicao_id: Number(instituicaoId),
          curso_id: Number(cursoId),
          nota_infraestrutura,
          obs_infraestrutura,
          nota_material_didatico,
          obs_material_didatico,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Avaliação enviada com sucesso!', 'success');
        navigate('/dashboard');
      } else {
        showNotification(data.message || 'Erro ao enviar avaliação.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao tentar enviar a avaliação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Avaliação</h1>
      <form onSubmit={handleSubmit}>
        <h2>Instituição</h2>
        <label htmlFor="instituicao_id">Instituição</label>
        <select
          id="instituicao_id"
          value={instituicaoId}
          onChange={(e) => setInstituicaoId(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">Selecione a Instituição</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.nome}</option>
          ))}
        </select>

        <label htmlFor="nota_infraestrutura">Infraestrutura (1-5)</label>
        <input
          type="number"
          id="nota_infraestrutura"
          min="1"
          max="5"
          required
          value={nota_infraestrutura}
          onChange={(e) => setNotaInfraestrutura(Number(e.target.value))}
          disabled={loading}
        />
        <textarea
          placeholder="Observações sobre a infraestrutura"
          value={obs_infraestrutura}
          onChange={(e) => setObsInfraestrutura(e.target.value)}
          disabled={loading}
        ></textarea>

        <h2>Curso</h2>
        <label htmlFor="curso_id">Curso</label>
        <select
          id="curso_id"
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          required
          disabled={!instituicaoId || loading}
        >
          <option value="">Selecione o Curso</option>
          {filteredCourses.map(course => (
            <option key={course.id} value={course.id}>{course.nome}</option>
          ))}
        </select>

        <label htmlFor="nota_material_didatico">Material Didático (1-5)</label>
        <input
          type="number"
          id="nota_material_didatico"
          min="1"
          max="5"
          required
          value={nota_material_didatico}
          onChange={(e) => setNotaMaterialDidatico(Number(e.target.value))}
          disabled={loading}
        />
        <textarea
          placeholder="Observações sobre o material didático"
          value={obs_material_didatico}
          onChange={(e) => setObsMaterialDidatico(e.target.value)}
          disabled={loading}
        ></textarea>

        <button type="submit" disabled={loading}>Salvar Avaliação</button>
        {loading && <p>Enviando avaliação...</p>}
      </form>
    </div>
  );
};

export default Avaliacao;
