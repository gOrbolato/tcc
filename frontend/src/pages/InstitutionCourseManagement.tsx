// src/pages/InstitutionCourseManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Tabs,
  Tab,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

// 1. Tipos para os dados
interface Instituicao { id: number; nome: string; }
interface Curso { id: number; nome: string; instituicaoId: number; }
interface Disciplina { id: number; nome: string; cursoId: number; }

// 2. Componente de Painel de Aba (helper)
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`crud-tabpanel-${index}`}
      aria-labelledby={`crud-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// 3. Componente de CRUD para Instituições (exemplo)
const InstituicaoCRUD: React.FC = () => {
  const [instituicoes, setInstituicoes] = useState<Instituicao[]>([]);
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchInstituicoes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/institution-courses/institutions');
      setInstituicoes(res.data);
    } catch (err) {
      showNotification('Erro ao buscar instituições', 'error');
    }
    setLoading(false);
  };

  useEffect(() => { fetchInstituicoes(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/institutions', { nome });
      showNotification('Instituição adicionada!', 'success');
      setNome('');
      fetchInstituicoes();
    } catch (err) {
      showNotification('Erro ao adicionar', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza?')) {
      try {
        await api.delete(`/admin/institutions/${id}`);
        showNotification('Instituição deletada!', 'success');
        fetchInstituicoes();
      } catch (err) {
        showNotification('Erro ao deletar', 'error');
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Adicionar Nova Instituição</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Nome da Instituição"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <Button type="submit" variant="contained" startIcon={<AddIcon />}>
          Adicionar
        </Button>
      </Box>
      <Divider />
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Instituições Existentes</Typography>
      {loading ? <CircularProgress /> : (
        <List>
          {instituicoes.map(inst => (
            <ListItem
              key={inst.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(inst.id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={inst.nome} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};


const InstitutionCourseManagement: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Entidades
      </Typography>
      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          {/* 4. As Abas */}
          <Tabs value={tabIndex} onChange={handleChange} aria-label="Abas de Gerenciamento">
            <Tab label="Instituições" id="crud-tab-0" />
            <Tab label="Cursos" id="crud-tab-1" />
            <Tab label="Disciplinas" id="crud-tab-2" />
          </Tabs>
        </Box>
        {/* 5. Painéis de Conteúdo */}
        <TabPanel value={tabIndex} index={0}>
          <InstituicaoCRUD />
        </TabPanel>
        <TabPanel value={tabIndex} index={1}>
          <Typography>CRUD de Cursos (Replicar lógica de InstituiçãoCRUD)</Typography>
        </TabPanel>
        <TabPanel value={tabIndex} index={2}>
          <Typography>CRUD de Disciplinas (Replicar lógica de InstituiçãoCRUD)</Typography>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default InstitutionCourseManagement;