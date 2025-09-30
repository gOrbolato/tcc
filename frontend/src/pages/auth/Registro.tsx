import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import '../../assets/styles/Auth.css';

// Tipagem para os dados do formulário
interface FormData {
  nome: string;
  cpf: string;
  ra: string;
  idade: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  instituicao_id: string; // Vai guardar o ID da instituição selecionada/criada
  curso_id: string; // Vai guardar o ID do curso selecionado/criado
  periodo: string;
  semestre: string;
}

const Registro: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    cpf: '',
    ra: '',
    idade: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    instituicao_id: '',
    curso_id: '',
    periodo: '',
    semestre: '',
  });

  // Estados para os valores digitados nos inputs de autocompletar
  const [instituicaoInput, setInstituicaoInput] = useState('');
  const [cursoInput, setCursoInput] = useState('');

  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [isInstituicaoNova, setIsInstituicaoNova] = useState(false);

  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // Busca todas as instituições na montagem do componente
  useEffect(() => {
    const fetchInstituicoes = async () => {
      try {
        const response = await api.get('/instituicoes');
        setInstituicoes(response.data);
      } catch (error) {
        addNotification('Erro ao carregar instituições.', 'error');
      }
    };
    fetchInstituicoes();
  }, [addNotification]);

  // Lida com a mudança no campo de texto da instituição
  const handleInstituicaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInstituicaoInput(value);

    // Verifica se a instituição digitada já existe na lista
    const instituicaoExistente = instituicoes.find(inst => inst.nome.toLowerCase() === value.toLowerCase());

    if (instituicaoExistente) {
      // Se existe, define o ID e busca os cursos
      setFormData(prev => ({ ...prev, instituicao_id: instituicaoExistente.id, curso_id: '' }));
      setCursoInput('');
      setIsInstituicaoNova(false);
      fetchCursos(instituicaoExistente.id);
    } else {
      // Se não existe, marca como nova e limpa os cursos
      setFormData(prev => ({ ...prev, instituicao_id: '', curso_id: '' }));
      setCursos([]);
      setCursoInput('');
      setIsInstituicaoNova(true);
    }
  };

  // Busca os cursos de uma instituição específica
  const fetchCursos = async (instituicaoId: string) => {
    try {
      const response = await api.get(`/instituicoes/${instituicaoId}/cursos`);
      setCursos(response.data);
    } catch (error) {
      addNotification('Erro ao carregar cursos.', 'error');
    }
  };
  
  // Lida com a mudança no campo de texto do curso
  const handleCursoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCursoInput(value);

    const cursoExistente = cursos.find(c => c.nome.toLowerCase() === value.toLowerCase());
    if(cursoExistente) {
        setFormData(prev => ({...prev, curso_id: cursoExistente.id}))
    } else {
        setFormData(prev => ({...prev, curso_id: ''}))
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) {
      addNotification('As senhas não coincidem.', 'error');
      return;
    }

    try {
      let finalInstituicaoId = formData.instituicao_id;
      let finalCursoId = formData.curso_id;

      // 1. Se a instituição é nova, cadastra-a primeiro
      if (isInstituicaoNova && instituicaoInput) {
        const response = await api.post('/instituicoes', { nome: instituicaoInput });
        finalInstituicaoId = response.data.id;
      }
      
      if (!finalInstituicaoId) {
        addNotification('Por favor, selecione uma instituição da lista ou digite um novo nome válido.', 'error');
        return;
      }

      // 2. Se o curso é novo, cadastra-o em seguida
      if (cursoInput && !finalCursoId) {
        const response = await api.post('/cursos', { nome: cursoInput, instituicao_id: finalInstituicaoId });
        finalCursoId = response.data.id;
      }
      
      if (!finalCursoId) {
        addNotification('Por favor, selecione um curso da lista ou digite um novo nome válido.', 'error');
        return;
      }

      // 3. Monta os dados finais e registra o usuário
      const dataToSubmit = {
        ...formData,
        instituicao_id: finalInstituicaoId,
        curso_id: finalCursoId,
      };
      delete (dataToSubmit as any).confirmarSenha;

      await api.post('/auth/register', dataToSubmit);
      addNotification('Registro realizado com sucesso! Por favor, faça o login.', 'success');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar o registro.';
      addNotification(message, 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-panel">
        <Link to="/" className="auth-home-link">
          <h1>Avaliação Educacional</h1>
        </Link>
      </div>
      <div className="auth-form-container">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Crie sua Conta</h2>
          
          {/* Campos Pessoais */}
          <div className="form-group">
            <label htmlFor="nome">Nome Completo</label>
            <input type="text" id="nome" name="nome" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label htmlFor="cpf">CPF</label>
            <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} required />
          </div>
          <div className="form-group">
            <label htmlFor="ra">RA</label>
            <input type="text" id="ra" name="ra" value={formData.ra} onChange={(e) => setFormData({...formData, ra: e.target.value})} required />
          </div>
          <div className="form-group">
            <label htmlFor="idade">Idade</label>
            <input type="number" id="idade" name="idade" value={formData.idade} onChange={(e) => setFormData({...formData, idade: e.target.value})} required />
          </div>

          {/* Campo de Instituição com Autocomplete */}
          <div className="form-group">
            <label htmlFor="instituicao">Instituição</label>
            <input 
              type="text"
              id="instituicao"
              name="instituicao"
              value={instituicaoInput}
              onChange={handleInstituicaoChange}
              list="instituicoes-list"
              placeholder="Comece a digitar o nome da sua instituição"
              required 
            />
            <datalist id="instituicoes-list">
              {instituicoes.map(inst => (
                <option key={inst.id} value={inst.nome} />
              ))}
            </datalist>
          </div>

          {/* Campo de Curso com Autocomplete */}
          <div className="form-group">
            <label htmlFor="curso">Curso</label>
            <input 
              type="text"
              id="curso"
              name="curso"
              value={cursoInput}
              onChange={handleCursoChange}
              list="cursos-list"
              placeholder={isInstituicaoNova ? "Digite o nome do novo curso" : "Selecione ou digite um curso"}
              required 
              disabled={!instituicaoInput}
            />
            <datalist id="cursos-list">
              {cursos.map(curso => (
                <option key={curso.id} value={curso.nome} />
              ))}
            </datalist>
          </div>
          
          <div className="form-group">
            <label htmlFor="periodo">Período</label>
            <select id="periodo" name="periodo" value={formData.periodo} onChange={(e) => setFormData({...formData, periodo: e.target.value})} required>
              <option value="">Selecione o período</option>
              <option value="Matutino">Matutino</option>
              <option value="Vespertino">Vespertino</option>
              <option value="Noturno">Noturno</option>
              <option value="Integral">Integral</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="semestre">Semestre</label>
            <input type="text" id="semestre" name="semestre" placeholder="Ex: 8º" value={formData.semestre} onChange={(e) => setFormData({...formData, semestre: e.target.value})} required />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" name="senha" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} required />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar Senha</label>
            <input type="password" id="confirmarSenha" name="confirmarSenha" value={formData.confirmarSenha} onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})} required />
          </div>

          <button type="submit">Registrar</button>

          <p className="auth-redirect">
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registro;