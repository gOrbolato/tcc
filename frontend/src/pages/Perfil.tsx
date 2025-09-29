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

const Perfil: React.FC = () => {
  const [instituicaoId, setInstituicaoId] = useState<string>('');
  const [cursoId, setCursoId] = useState<string>('');
  const [periodo, setPeriodo] = useState<string>('');
  const [novaSenha, setNovaSenha] = useState<string>('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState<string>('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const [profileRes, institutionsRes, coursesRes] = await Promise.all([
          fetch('/api/perfil', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/institutions', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        const profileData = await profileRes.json();
        const institutionsData = await institutionsRes.json();
        const coursesData = await coursesRes.json();

        if (profileRes.ok) {
          setInstituicaoId(profileData.instituicao_id ? String(profileData.instituicao_id) : '');
          setCursoId(profileData.curso_id ? String(profileData.curso_id) : '');
          setPeriodo(profileData.periodo || '');
        } else {
          showNotification(profileData.message || 'Erro ao carregar perfil.', 'error');
        }

        if (institutionsRes.ok) {
          setInstitutions(institutionsData);
        } else {
          console.error('Erro ao carregar instituições:', institutionsData.message);
          showNotification(institutionsData.message || 'Erro ao carregar instituições.', 'error');
        }

        if (coursesRes.ok) {
          setCourses(coursesData);
        } else {
          console.error('Erro ao carregar cursos:', coursesData.message);
          showNotification(coursesData.message || 'Erro ao carregar cursos.', 'error');
        }

      } catch (err) {
        showNotification('Ocorreu um erro ao carregar o perfil ou dados de instituições/cursos.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate, showNotification]);

  useEffect(() => {
    if (instituicaoId) {
      setFilteredCourses(courses.filter(course => course.instituicao_id === Number(instituicaoId)));
    } else {
      setFilteredCourses([]);
    }
    // Não resetar cursoId aqui para manter o valor do perfil se ele for válido para a instituição selecionada
  }, [instituicaoId, courses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (novaSenha && novaSenha !== confirmarNovaSenha) {
      showNotification('As novas senhas não coincidem.', 'error');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/perfil', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          curso_id: Number(cursoId),
          instituicao_id: Number(instituicaoId),
          periodo,
          novaSenha: novaSenha || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Perfil atualizado com sucesso!', 'success');
        setNovaSenha('');
        setConfirmarNovaSenha('');
      } else {
        showNotification(data.message || 'Erro ao atualizar perfil.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao tentar atualizar o perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Carregando perfil...</p>;

  return (
    <div>
      <h1>Perfil</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nova Senha"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Confirmar Nova Senha"
          value={confirmarNovaSenha}
          onChange={(e) => setConfirmarNovaSenha(e.target.value)}
          disabled={loading}
        />
        
        <select
          name="instituicao_id"
          value={instituicaoId}
          onChange={(e) => setInstituicaoId(e.target.value)}
          disabled={loading}
        >
          <option value="">Selecione a Instituição</option>
          {institutions.map(inst => (
            <option key={inst.id} value={inst.id}>{inst.nome}</option>
          ))}
        </select>

        <select
          name="curso_id"
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          disabled={!instituicaoId || loading}
        >
          <option value="">Selecione o Curso</option>
          {filteredCourses.map(course => (
            <option key={course.id} value={course.id}>{course.nome}</option>
          ))}
        </select>

        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} disabled={loading}>
          <option value="">Período</option>
          <option value="diurno">Diurno</option>
          <option value="noturno">Noturno</option>
          <option value="integral">Integral</option>
        </select>
        <button type="submit" disabled={loading}>Salvar Alterações</button>
      </form>
    </div>
  );
};

export default Perfil;
