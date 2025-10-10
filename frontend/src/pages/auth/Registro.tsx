import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import api from '../../services/api';
import AuthLayout from '../../components/AuthLayout';
import '../../assets/styles/Auth.css';

// --- Interfaces e Tipos ---
interface FormData {
  nome: string; cpf: string; ra: string; idade: string; email: string;
  senha: string; confirmarSenha: string; instituicao_id: string;
  curso_id: string; periodo: string; semestre: string;
}
// --------------------------

const Registro: React.FC = () => {
  // --- Estados ---
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
  const [instituicaoInput, setInstituicaoInput] = useState('');
  const [cursoInput, setCursoInput] = useState('');
  const [instituicoes, setInstituicoes] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  // ----------------

  // --- Funções e Efeitos ---
  const isValidCPF = (cpf: string): boolean => { /* ... lógica de validação do CPF ... */ return true; };

  useEffect(() => {
    const fetchInstituicoes = async () => {
      try {
        const response = await api.get('/institutions');
        setInstituicoes(response.data);
      } catch (error) { showNotification('Erro ao carregar instituições.', 'error'); }
    };
    fetchInstituicoes();
  }, [showNotification]);

  const handleInstituicaoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInstituicaoInput(value);
    const instituicaoExistente = instituicoes.find(inst => inst.nome.toLowerCase() === value.toLowerCase());
    if (instituicaoExistente) {
      try {
        const response = await api.get(`/institutions/${instituicaoExistente.id}/courses`);
        setCursos(response.data);
      } catch (error) { showNotification('Erro ao carregar cursos.', 'error'); }
    } else {
      setCursos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.senha !== formData.confirmarSenha) { showNotification('As senhas não coincidem.', 'error'); return; }
    if (formData.senha.length < 8) { showNotification('A senha deve ter pelo menos 8 caracteres.', 'error'); return; }
    if (!isValidCPF(formData.cpf)) { showNotification('O CPF inserido é inválido.', 'error'); return; }

    try {
      const instResponse = await api.post('/institutions', { nome: instituicaoInput });
      const finalInstituicaoId = instResponse.data.id;

      const courseResponse = await api.post('/courses', { nome: cursoInput, instituicao_id: finalInstituicaoId });
      const finalCursoId = courseResponse.data.id;

      const dataToSubmit = { ...formData, instituicao_id: finalInstituicaoId, curso_id: finalCursoId };
      delete (dataToSubmit as any).confirmarSenha;

      await api.post('/auth/register', dataToSubmit);
      showNotification('Registro realizado com sucesso! Por favor, faça o login.', 'success');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao realizar o registro.';
      showNotification(message, 'error');
    }
  };
  // ------------------------

  return (
    <AuthLayout title="Crie sua Conta">
      <form onSubmit={handleSubmit}>
        {/* Campos Pessoais */}
        <div className="form-group"><label>Nome Completo</label><input type="text" value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required /></div>
        <div className="form-group"><label>E-mail</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
        <div className="form-group"><label>CPF</label><input type="text" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} required /></div>
        <div className="form-group"><label>RA</label><input type="text" value={formData.ra} onChange={(e) => setFormData({...formData, ra: e.target.value})} required /></div>
        <div className="form-group"><label>Idade</label><input type="number" value={formData.idade} onChange={(e) => setFormData({...formData, idade: e.target.value})} required /></div>

        {/* Campos Acadêmicos */}
        <div className="form-group">
          <label>Instituição</label>
          <input type="text" value={instituicaoInput} onChange={handleInstituicaoChange} list="instituicoes-list" placeholder="Digite o nome da sua instituição" required />
          <datalist id="instituicoes-list">{instituicoes.map(inst => <option key={inst.id} value={inst.nome} />)}</datalist>
        </div>
        <div className="form-group">
          <label>Curso</label>
          <input type="text" value={cursoInput} onChange={(e) => setCursoInput(e.target.value)} list="cursos-list" placeholder="Digite o nome do seu curso" required disabled={!instituicaoInput} />
          <datalist id="cursos-list">{cursos.map(curso => <option key={curso.id} value={curso.nome} />)}</datalist>
        </div>
        <div className="form-group"><label>Período</label><select value={formData.periodo} onChange={(e) => setFormData({...formData, periodo: e.target.value})} required><option value="">Selecione</option><option>Matutino</option><option>Vespertino</option><option>Noturno</option><option>Integral</option></select></div>
        <div className="form-group"><label>Semestre</label><input type="text" placeholder="Ex: 8º" value={formData.semestre} onChange={(e) => setFormData({...formData, semestre: e.target.value})} required /></div>

        {/* Campos de Senha */}
        <div className="form-group"><label>Senha</label><input type="password" value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} required /></div>
        <div className="form-group"><label>Confirmar Senha</label><input type="password" value={formData.confirmarSenha} onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})} required /></div>

        <button type="submit">Registrar</button>
        <p className="auth-redirect">Já tem uma conta? <Link to="/login">Faça login</Link></p>
      </form>
    </AuthLayout>
  );
};

export default Registro;