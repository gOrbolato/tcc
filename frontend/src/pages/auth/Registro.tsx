// Importa React, hooks e componentes de UI.
import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';
import { TextField, Button, Box, Typography, Link, CircularProgress, FormControl, InputLabel, Select, MenuItem, Autocomplete } from '@mui/material';

// Tipos para os dados dos dropdowns.
interface Instituicao { id: number; nome: string; }
interface Curso { id: number; nome: string; instituicao_id: number; }

/**
 * @component Registro
 * @description Página de cadastro de novos usuários. Contém um formulário completo
 * com validações e campos de Autocomplete para seleção de instituição e curso.
 */
const Registro: React.FC = () => {
  // Estados para cada campo do formulário.
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ra, setRa] = useState('');
  const [cpf, setCpf] = useState('');
  const [instituicao, setInstituicao] = useState<Instituicao | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [semestre, setSemestre] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [previsaoTermino, setPrevisaoTermino] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  
  // Estados de controle.
  const [loading, setLoading] = useState(false);
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [cursosFiltrados, setCursosFiltrados] = useState<Curso[]>([]);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Busca a lista de instituições ao montar o componente.
  useEffect(() => {
    api.get('/institutions').then(res => setInstituicoes(res.data)).catch(console.error);
  }, []);

  // Busca os cursos correspondentes sempre que uma instituição é selecionada.
  useEffect(() => {
    if (instituicao) {
      api.get(`/institutions/${instituicao.id}/courses`).then(res => setCursosFiltrados(res.data)).catch(console.error);
    } else {
      setCursosFiltrados([]);
    }
  }, [instituicao]);

  // Função para submeter o formulário de registro.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      showNotification('As senhas não coincidem!', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome, email, senha, ra,
        cpf: cpf || undefined,
        institutionId: instituicao?.id,
        courseId: curso?.id,
        cidade: cidade || undefined,
        estado: estado || undefined,
        semestre: semestre ? Number(semestre) : undefined,
        periodo: periodo || undefined,
        previsaoTermino: previsaoTermino || undefined,
      });
      showNotification('Registro realizado com sucesso!', 'success');
      navigate('/login');
    } catch (error: any) {
      // Trata erros de validação retornados pelo backend.
      if (error.response?.status === 400 && error.response.data.errors) {
        error.response.data.errors.forEach((err: any) => showNotification(err.msg, 'error'));
      } else {
        const errorMessage = error.response?.data?.message || 'Erro ao realizar registro.';
        showNotification(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Criar Conta">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          {/* Campos do formulário */}
          <TextField sx={{ gridColumn: '1 / -1' }} margin="normal" required fullWidth id="nome" label="Nome Completo" name="nome" value={nome} onChange={(e) => setNome(e.target.value)} disabled={loading} autoFocus />
          <TextField margin="normal" fullWidth id="cpf" label="CPF" name="cpf" value={cpf} onChange={(e) => setCpf(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth id="ra" label="RA (Registro Acadêmico)" name="ra" value={ra} onChange={(e) => setRa(e.target.value)} disabled={loading} />
          <Autocomplete sx={{ gridColumn: '1 / -1' }} id="instituicao" options={instituicoes} getOptionLabel={(o) => o.nome} onChange={(e, v) => { setInstituicao(v); setCurso(null); }} renderInput={(params) => <TextField {...params} label="Instituição" margin="normal" fullWidth />} />
          <Autocomplete sx={{ gridColumn: '1 / -1' }} id="curso" options={cursosFiltrados} getOptionLabel={(o) => o.nome} onChange={(e, v) => setCurso(v)} value={curso} disabled={!instituicao} renderInput={(params) => <TextField {...params} label="Curso" margin="normal" fullWidth />} />
          <TextField sx={{ gridColumn: '1 / -1' }} margin="normal" fullWidth id="cidade" label="Cidade" name="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} disabled={loading} />
          <FormControl sx={{ gridColumn: '1 / -1' }} fullWidth margin="normal" disabled={loading}>
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select labelId="estado-label" id="estado" value={estado} label="Estado" onChange={(e) => setEstado(e.target.value)}>
              {/* Opções de estados */}
              {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(uf => <MenuItem key={uf} value={uf}>{uf}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" disabled={loading}>
            <InputLabel id="periodo-label">Período</InputLabel>
            <Select labelId="periodo-label" id="periodo" value={periodo} label="Período" onChange={(e) => setPeriodo(e.target.value)}>
              <MenuItem value="matutino">Matutino</MenuItem>
              <MenuItem value="noturno">Noturno</MenuItem>
              <MenuItem value="integral">Integral</MenuItem>
            </Select>
          </FormControl>
          <TextField margin="normal" fullWidth id="semestre" label="Semestre" name="semestre" type="number" inputProps={{ min: 1 }} value={semestre} onChange={(e) => setSemestre(e.target.value)} disabled={loading} />
          <TextField sx={{ gridColumn: '1 / -1' }} margin="normal" fullWidth id="previsao-termino" label="Previsão de término (mês/ano)" name="previsao-termino" type="month" value={previsaoTermino} onChange={(e) => setPrevisaoTermino(e.target.value)} InputLabelProps={{ shrink: true }} disabled={loading} />
          <TextField sx={{ gridColumn: '1 / -1' }} margin="normal" required fullWidth id="email" label="Endereço de E-mail" name="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth name="senha" label="Senha" type="password" id="senha" value={senha} onChange={(e) => setSenha(e.target.value)} disabled={loading} />
          <TextField margin="normal" required fullWidth name="confirmarSenha" label="Confirmar Senha" type="password" id="confirmarSenha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} disabled={loading} />
        </Box>

        <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
          <Button type="submit" fullWidth variant="contained" sx={{ py: 1.5 }} disabled={loading}>Registrar</Button>
          {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />}
        </Box>

        <Typography variant="body2" align="center">Já tem uma conta?{' '}<Link component={RouterLink} to="/login" variant="body2">Faça login</Link></Typography>
      </Box>
    </AuthLayout>
  );
};

export default Registro;