import React, { useEffect, useState } from 'react';
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
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import FilterActions from '../pages/admin/reports/components/FilterActions';

import EditInstitutionModal from './admin/components/EditInstitutionModal';
import EditCourseModal from './admin/components/EditCourseModal';
import type { Course } from '../types/course';

// Types
interface Instituicao { id: number; nome: string; }


// Presentational: InstituicaoCRUD
const InstituicaoCRUD: React.FC<{
  institutions: Instituicao[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onSearch: (q?: string) => Promise<void>;
  onEdit?: (inst: Instituicao) => void;
}> = ({ institutions, loading, onDelete, onSearch, onEdit }) => {
  const [query, setQuery] = useState('');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Instituições</Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField placeholder="Buscar instituições" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ flex: 1 }} />
        <FilterActions onSearch={() => onSearch(query)} onClear={() => { setQuery(''); onSearch(); }} searching={loading} searchLabel="BUSCAR" />
      </Box>

      <Divider />
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Instituições Existentes</Typography>
      {loading ? <CircularProgress /> : (
        <List>
          {institutions.map(inst => (
            <ListItem key={inst.id} secondaryAction={(
              <>
                <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }} onClick={() => onEdit?.(inst)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => onDelete(inst.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}>
              <ListItemText primary={inst.nome} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

// Presentational: CursoCRUD
const CursoCRUD: React.FC<{
  courses: Course[];
  institutions: Instituicao[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onSearch: (institutionId?: number | '', q?: string) => Promise<void>;
  onEdit?: (course: Course) => void;
}> = ({ courses, institutions, loading, onDelete, onSearch, onEdit }) => {
  const [query, setQuery] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | ''>('');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Cursos</Typography>

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField placeholder="Buscar cursos" value={query} onChange={(e) => setQuery(e.target.value)} sx={{ flex: 1 }} />
        <TextField select SelectProps={{ native: true }} value={selectedInstitution} onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : '')} sx={{ width: 320 }}>
          <option value="">Todas Instituições</option>
          {institutions.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
        </TextField>
        <FilterActions onSearch={() => onSearch(selectedInstitution, query)} onClear={() => { setQuery(''); setSelectedInstitution(''); onSearch(); }} searching={loading} searchLabel="BUSCAR" />
      </Box>

      <Divider />
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Cursos Existentes</Typography>
      {loading ? <CircularProgress /> : (
        <List>
          {courses.map(course => (
            <ListItem key={course.id} secondaryAction={(
              <>
                <IconButton edge="end" aria-label="edit" sx={{ mr: 1 }} onClick={() => onEdit?.(course)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => onDelete(course.id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            )}>
              <ListItemText primary={course.nome} />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

const InstitutionCourseManagement: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [institutions, setInstitutions] = useState<Instituicao[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const { showNotification } = useNotification();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const fetchInstitutions = async (q?: string) => {
    setLoadingInstitutions(true);
    try {
      const res = await api.get(`/entities/institutions${q ? `?q=${q}` : ''}`);
      setInstitutions(res.data || []);
    } catch (err) {
      showNotification('Erro ao buscar instituições', 'error');
    }
    setLoadingInstitutions(false);
  };

  const fetchCourses = async (institutionId?: number | '', q?: string) => {
    setLoadingCourses(true);
    try {
      const params = new URLSearchParams();
      if (institutionId) {
        params.append('institutionId', String(institutionId));
      }
      if (q) {
        params.append('q', q);
      }
      const res = await api.get(`/entities/courses?${params.toString()}`);
      setCourses(res.data || []);
    } catch (err) {
      showNotification('Erro ao buscar cursos', 'error');
    }
    setLoadingCourses(false);
  };

  useEffect(() => {
    fetchInstitutions();
    fetchCourses();
  }, []);

  const deleteInstitution = async (id: number) => {
    await api.delete(`/entities/institutions/${id}`);
    await fetchInstitutions();
  };

  const deleteCourse = async (id: number) => {
    await api.delete(`/entities/courses/${id}`);
    await fetchCourses();
  };

  const [institutionToEdit, setInstitutionToEdit] = useState<Instituicao | null>(null);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const handleInstitutionUpdated = (updatedInstitution: Instituicao) => {
    setInstitutions(prev => prev.map(i => i.id === updatedInstitution.id ? updatedInstitution : i));
  };

  const handleCourseUpdated = (updatedCourse: Course) => {
    setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <EditInstitutionModal
        institution={institutionToEdit}
        open={!!institutionToEdit}
        onClose={() => setInstitutionToEdit(null)}
        onInstitutionUpdated={handleInstitutionUpdated}
      />
      <EditCourseModal
        course={courseToEdit}
        open={!!courseToEdit}
        onClose={() => setCourseToEdit(null)}
        onCourseUpdated={handleCourseUpdated}
      />
      <Typography variant="h4" component="h1" gutterBottom>
        Gerenciamento de Entidades
      </Typography>

      <Paper elevation={3}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleChange} aria-label="Abas de Gerenciamento">
            <Tab label="Instituições" id="crud-tab-0" />
            <Tab label="Cursos" id="crud-tab-1" />
          </Tabs>
        </Box>

        <Box sx={{ p: 3 }}>
          {tabIndex === 0 && (
            <InstituicaoCRUD
              institutions={institutions}
              loading={loadingInstitutions}
              onDelete={deleteInstitution}
              onSearch={(q) => fetchInstitutions(q)}
              onEdit={(inst) => setInstitutionToEdit(inst)}
            />
          )}
          {tabIndex === 1 && (
            <CursoCRUD
              courses={courses}
              institutions={institutions}
              loading={loadingCourses}
              onDelete={deleteCourse}
              onSearch={(instId, q) => fetchCourses(instId, q)}
              onEdit={(course) => setCourseToEdit(course)}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default InstitutionCourseManagement;