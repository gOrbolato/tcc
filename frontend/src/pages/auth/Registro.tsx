import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import AuthLayout from '../../components/AuthLayout';
import api from '../../services/api';

// 1. Importar todos os componentes de formulário necessários
import { TextField, Button, Box, Typography, Link, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

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
  const [cpf, setCpf] = useState('');
  const [instituicaoTexto, setInstituicaoTexto] = useState('');
  const [cursoTexto, setCursoTexto] = useState('');
  const [semestre, setSemestre] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [previsaoTermino, setPrevisaoTermino] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');

  // States de loading e dados dos dropdowns
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // Note: institution/course selects removed; user types institution/curso in the text fields below

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
        cpf: cpf || undefined,
  institutionText: instituicaoTexto || undefined,
  courseText: cursoTexto || undefined,
          cidade: cidade || undefined,
          estado: estado || undefined,
        semestre: semestre ? Number(semestre) : undefined,
        periodo: periodo || undefined,
        previsaoTermino: previsaoTermino || undefined,
      });
      showNotification('Registro realizado com sucesso!', 'success');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao realizar registro. Verifique seus dados.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // (select handlers removed)

  return (
    <AuthLayout title="Criar Conta">
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        {/* 3. Layout responsivo do formulário usando Box (substitui Grid) */}
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
          {/* Nome (full width) */}
          <Box sx={{ gridColumn: '1 / -1' }}>
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

          {/* CPF & RA on same row */}
          <Box>
            <TextField
              margin="normal"
              fullWidth
              id="cpf"
              label="CPF"
              name="cpf"
              autoComplete="off"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
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

          {/* Instituição (full width) */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              margin="normal"
              fullWidth
              id="instituicao-texto"
              label="Instituição"
              name="instituicao-texto"
              placeholder="Digite sua instituição"
              value={instituicaoTexto}
              onChange={(e) => setInstituicaoTexto(e.target.value)}
              disabled={loading}
            />
          </Box>

          {/* Curso (full width) */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              margin="normal"
              fullWidth
              id="curso-texto"
              label="Curso"
              name="curso-texto"
              placeholder="Digite seu curso"
              value={cursoTexto}
              onChange={(e) => setCursoTexto(e.target.value)}
              disabled={loading}
            />
          </Box>

          {/* Cidade (texto) */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              margin="normal"
              fullWidth
              id="cidade"
              label="Cidade"
              name="cidade"
              placeholder="Digite sua cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              disabled={loading}
            />
          </Box>

          {/* Estado (select) */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <FormControl fullWidth margin="normal" disabled={loading}>
              <InputLabel id="estado-label">Estado</InputLabel>
              <Select
                labelId="estado-label"
                id="estado"
                value={estado}
                label="Estado"
                onChange={(e) => setEstado(e.target.value)}
              >
                <MenuItem value="">-- Selecione --</MenuItem>
                <MenuItem value="AC">Acre (AC)</MenuItem>
                <MenuItem value="AL">Alagoas (AL)</MenuItem>
                <MenuItem value="AP">Amapá (AP)</MenuItem>
                <MenuItem value="AM">Amazonas (AM)</MenuItem>
                <MenuItem value="BA">Bahia (BA)</MenuItem>
                <MenuItem value="CE">Ceará (CE)</MenuItem>
                <MenuItem value="DF">Distrito Federal (DF)</MenuItem>
                <MenuItem value="ES">Espírito Santo (ES)</MenuItem>
                <MenuItem value="GO">Goiás (GO)</MenuItem>
                <MenuItem value="MA">Maranhão (MA)</MenuItem>
                <MenuItem value="MT">Mato Grosso (MT)</MenuItem>
                <MenuItem value="MS">Mato Grosso do Sul (MS)</MenuItem>
                <MenuItem value="MG">Minas Gerais (MG)</MenuItem>
                <MenuItem value="PA">Pará (PA)</MenuItem>
                <MenuItem value="PB">Paraíba (PB)</MenuItem>
                <MenuItem value="PR">Paraná (PR)</MenuItem>
                <MenuItem value="PE">Pernambuco (PE)</MenuItem>
                <MenuItem value="PI">Piauí (PI)</MenuItem>
                <MenuItem value="RJ">Rio de Janeiro (RJ)</MenuItem>
                <MenuItem value="RN">Rio Grande do Norte (RN)</MenuItem>
                <MenuItem value="RS">Rio Grande do Sul (RS)</MenuItem>
                <MenuItem value="RO">Rondônia (RO)</MenuItem>
                <MenuItem value="RR">Roraima (RR)</MenuItem>
                <MenuItem value="SC">Santa Catarina (SC)</MenuItem>
                <MenuItem value="SP">São Paulo (SP)</MenuItem>
                <MenuItem value="SE">Sergipe (SE)</MenuItem>
                <MenuItem value="TO">Tocantins (TO)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Periodo & Semestre on same row */}
          <Box>
            <FormControl fullWidth margin="normal" disabled={loading}>
              <InputLabel id="periodo-label">Período</InputLabel>
              <Select labelId="periodo-label" id="periodo" value={periodo} label="Período" onChange={(e) => setPeriodo(e.target.value)}>
                <MenuItem value="matutino">Matutino</MenuItem>
                <MenuItem value="noturno">Noturno</MenuItem>
                <MenuItem value="integral">Integral</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              margin="normal"
              fullWidth
              id="semestre"
              label="Semestre"
              name="semestre"
              type="number"
              inputProps={{ min: 1 }}
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              disabled={loading}
            />
          </Box>

          {/* Previsão Término (full width) */}
          <Box sx={{ gridColumn: '1 / -1' }}>
            <TextField
              margin="normal"
              fullWidth
              id="previsao-termino"
              label="Previsão de término (mês/ano)"
              name="previsao-termino"
              type="month"
              value={previsaoTermino}
              onChange={(e) => setPrevisaoTermino(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ style: { paddingTop: 14 } }}
              disabled={loading}
            />
          </Box>

          {/* Email (full width) */}
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

          {/* Senha & Confirmar Senha on same row */}
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