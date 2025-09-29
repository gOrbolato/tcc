import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';
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

const Registro: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    ra: '',
    idade: '',
    instituicao_id: '',
    curso_id: '',
    periodo: '',
    semestre: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchInstitutionsAndCourses = async () => {
      try {
        const token = localStorage.getItem('token'); // Pode ser necessário um token para listar, ou tornar a rota pública
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;

        const [institutionsRes, coursesRes] = await Promise.all([
          fetch('/api/institutions', { headers }),
          fetch('/api/courses', { headers }),
        ]);

        const institutionsData = await institutionsRes.json();
        const coursesData = await coursesRes.json();

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
        console.error('Erro ao carregar instituições e cursos:', err);
        showNotification('Erro ao carregar instituições e cursos.', 'error');
      }
    };
    fetchInstitutionsAndCourses();
  }, []);

  useEffect(() => {
    if (formData.instituicao_id) {
      setFilteredCourses(courses.filter(course => course.instituicao_id === Number(formData.instituicao_id)));
    } else {
      setFilteredCourses([]);
    }
    setFormData(prev => ({ ...prev, curso_id: '' })); // Resetar curso ao mudar instituição
  }, [formData.instituicao_id, courses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (formData.senha !== formData.confirmarSenha) {
      showNotification('As senhas não coincidem.', 'error');
      setLoading(false);
      return;
    }
    if (!validatePassword(formData.senha)) {
      showNotification('A senha deve ter no mínimo 8 caracteres, uma letra maiúscula, uma minúscula, um número e um caractere especial.', 'error');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome: formData.nome,
          cpf: formData.cpf,
          ra: formData.ra,
          idade: parseInt(formData.idade),
          instituicao_id: Number(formData.instituicao_id),
          curso_id: Number(formData.curso_id),
          periodo: formData.periodo,
          semestre: formData.semestre,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('Cadastro realizado com sucesso!', 'success');
        navigate('/login');
      } else {
        showNotification(data.message || 'Erro ao tentar se cadastrar.', 'error');
      }
    } catch (err) {
      showNotification('Ocorreu um erro ao tentar se cadastrar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <Link to="/">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div className="auth-main">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Cadastro</h2>
          <input type="text" name="nome" placeholder="Nome Completo" onChange={handleChange} required disabled={loading} />
          <input type="text" name="cpf" placeholder="CPF" onChange={handleChange} required disabled={loading} />
          <input type="text" name="ra" placeholder="RA" onChange={handleChange} required disabled={loading} />
          <input type="number" name="idade" placeholder="Idade" onChange={handleChange} required disabled={loading} />
          
          <select name="instituicao_id" value={formData.instituicao_id} onChange={handleChange} required disabled={loading}>
            <option value="">Selecione a Instituição</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.nome}</option>
            ))}
          </select>

          <select name="curso_id" value={formData.curso_id} onChange={handleChange} required disabled={!formData.instituicao_id || loading}>
            <option value="">Selecione o Curso</option>
            {filteredCourses.map(course => (
              <option key={course.id} value={course.id}>{course.nome}</option>
            ))}
          </select>

          <select name="periodo" value={formData.periodo} onChange={handleChange} required disabled={loading}>
            <option value="">Período</option>
            <option value="diurno">Diurno</option>
            <option value="noturno">Noturno</option>
            <option value="integral">Integral</option>
          </select>
          <input type="text" name="semestre" placeholder="Módulo ou Semestre" onChange={handleChange} required disabled={loading} />
          <input type="email" name="email" placeholder="E-mail" onChange={handleChange} required disabled={loading} />
          <input type="password" name="senha" placeholder="Senha" onChange={handleChange} required disabled={loading} />
          <input type="password" name="confirmarSenha" placeholder="Confirmar Senha" onChange={handleChange} required disabled={loading} />
          <button type="submit" disabled={loading}>Salvar</button>
          {loading && <p>Cadastrando...</p>}
          <p className="auth-link">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};
export default Registro;
