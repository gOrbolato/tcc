import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';

// 1. Importar todos os componentes de formulário necessários
import {
  TextField,
  Button,
  Box,
  Typography,
  Link,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

// Definir tipos para os dados (bom para clareza)
interface Instituicao {
  id: number;
  nome: string;
}

interface Curso {
  id: number;
  nome: string;
}

const Registro: React.FC = () => {
  // ... (seus states de formulário)
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ra, setRa] = useState('');
  const [instituicaoId, setInstituicaoId] = useState('');
  const [cursoId, setCursoId] = useState('');

  // States de loading e dados dos dropdowns
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCursos, setLoadingCursos] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Buscar instituições no carregamento
  useEffect(() => {
    const fetchInstituicoes = async () => {
      try {
        const response = await api.get('/institution-courses/institutions');
        setInstituicoes(response.data);
      } catch (error) {
        showNotification('Erro ao carregar instituições', 'error');
      }
    };
    fetchInstituicoes();
  }, [showNotification]);

  // Buscar cursos quando a instituição mudar
  useEffect(() => {
    if (instituicaoId) {
      const fetchCursos = async () => {
        setLoadingCursos(true);
        try {
          const response = await api.get(`/institution-courses/courses/${instituicaoId}`);
          setCursos(response.data);
          setCursoId(''); // Resetar seleção de curso
        } catch (error) {
          showNotification('Erro ao carregar cursos', 'error');
        } finally {
          setLoadingCursos(false);
        }
      };
      fetchCursos();
    }
  }, [instituicaoId, showNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha !== confirmarSenha) {
      showNotification('As senhas não coincidem!', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome,
        email,
        senha,
        ra,
        institutionId: Number(instituicaoId),
        courseId: Number(cursoId),
      });
      showNotification('Registro realizado com sucesso!', 'success');
      navigate('/login');
    } catch (error) {
      showNotification('Erro ao realizar registro. Verifique seus dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handlers para os Selects do MUI
  const handleInstituicaoChange = (e: SelectChangeEvent<string>) => {
    setInstituicaoId(e.target.value);
  };

  const handleCursoChange = (e: SelectChangeEvent<string>) => {
    setCursoId(e.target.value);
  };

  return (
    <AuthLayout title="Criar Conta">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        {/* 3. Layout responsivo do formulário usando Box (substitui Grid) */}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="nome"
              label="Nome Completo"
              name="nome"
              autoComplete="name"
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={loading}
            />
          </Box>
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="ra"
              label="RA (Registro Acadêmico)"
              name="ra"
              autoComplete="off"
              value={ra}
              onChange={(e) => setRa(e.target.value)}
              disabled={loading}
            />
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Endereço de E-mail"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </Box>
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="senha"
              label="Senha"
              type="password"
              id="senha"
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
            />
          </Box>
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmarSenha"
              label="Confirmar Senha"
              type="password"
              id="confirmarSenha"
              autoComplete="new-password"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              disabled={loading}
            />
          </Box>

          {/* 4. Substituir <select> por <FormControl> + <Select> */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <FormControl fullWidth margin="normal" required disabled={loading}>
              <InputLabel id="instituicao-label">Instituição</InputLabel>
              <Select
                labelId="instituicao-label"
                id="instituicao"
                value={instituicaoId}
                label="Instituição"
                onChange={handleInstituicaoChange}
              >
                {instituicoes.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <FormControl fullWidth margin="normal" required disabled={loading || loadingCursos || !instituicaoId}>
              <InputLabel id="curso-label">Curso</InputLabel>
              <Select
                labelId="curso-label"
                id="curso"
                value={cursoId}
                label="Curso"
                onChange={handleCursoChange}
              >
                {/* 5. Mostrar loading dentro do Select */}
                {loadingCursos ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ margin: 'auto' }} />
                  </MenuItem>
                ) : (
                  cursos.map((curso) => (
                    <MenuItem key={curso.id} value={curso.id}>
                      {curso.nome}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', mt: 3, mb: 2 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ py: 1.5 }}
            disabled={loading}
          >
            Registrar
          </Button>
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>

        <Typography variant="body2" align="center">
          Já tem uma conta?{' '}
          <Link component={RouterLink} to="/login" variant="body2">
            Faça login
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Registro;