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
import MergeIcon from '@mui/icons-material/Merge';
import api from '../services/api';
import { useNotification } from '../contexts/NotificationContext';
import GenericSearchFilter from './admin/reports/components/GenericSearchFilter';
import ReportFilters, { type SearchOptions } from './admin/reports/components/ReportFilters';
import EditInstitutionModal from './admin/components/EditInstitutionModal';
import EditCourseModal from './admin/components/EditCourseModal';
import MergeModal from './admin/components/MergeModal';
import type { Course } from '../types/course';

// Types
interface Instituicao { id: number; nome: string; }


// Presentational: InstituicaoCRUD
const InstituicaoCRUD: React.FC<{
  institutions: Instituicao[];
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onSearch: (q: string) => Promise<void>;
  onEdit?: (inst: Instituicao) => void;
  onMerge?: (inst: Instituicao) => void;
}> = ({ institutions, loading, onDelete, onSearch, onEdit, onMerge }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Instituições</Typography>

      <Box sx={{ mb: 2 }}>
        <GenericSearchFilter
          onSearch={(q) => onSearch(q)}
          onClear={() => onSearch('')}
          loading={loading}
          placeholder="Buscar instituições"
          searchLabel="BUSCAR"
        />
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
                <IconButton edge="end" aria-label="merge" sx={{ mr: 1 }} onClick={() => onMerge?.(inst)}>
                  <MergeIcon />
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
  loading: boolean;
  onDelete: (id: number) => Promise<void>;
  onSearch: (options: SearchOptions) => Promise<void>;
  onEdit?: (course: Course) => void;
  onMerge?: (course: Course) => void;
}> = ({ courses, loading, onDelete, onSearch, onEdit, onMerge }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Cursos</Typography>

      <Box sx={{ mb: 2 }}>
        <ReportFilters
          onSearch={onSearch}
          onClear={() => onSearch({})}
          loading={loading}
        />
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
                <IconButton edge="end" aria-label="merge" sx={{ mr: 1 }} onClick={() => onMerge?.(course)}>
                  <MergeIcon />
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
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [sourceEntity, setSourceEntity] = useState<Instituicao | Course | null>(null);
  const [entityType, setEntityType] = useState<'institution' | 'course'>('institution');

  const { showNotification } = useNotification();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const fetchInstitutions = async (q?: string) => {
    setLoadingInstitutions(true);
    try {
      const res = await api.get(`/institutions${q ? `?q=${q}` : ''}`);
      setInstitutions(res.data || []);
    } catch (err) {
      showNotification('Erro ao buscar instituições', 'error');
    }
    setLoadingInstitutions(false);
  };

  const fetchCourses = async (options: SearchOptions) => {
    setLoadingCourses(true);
    try {
      const params = new URLSearchParams();
      if (options.institutionId) {
        params.append('institutionId', String(options.institutionId));
      }
      if (options.courseId) {
        params.append('courseId', String(options.courseId));
      }
      const res = await api.get(`/courses?${params.toString()}`);
      setCourses(res.data || []);
    } catch (err) {
      showNotification('Erro ao buscar cursos', 'error');
    }
    setLoadingCourses(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchInstitutions();
      await fetchCourses({});
    };
    fetchData();
  }, []);

  const deleteInstitution = async (id: number) => {
    try {
      await api.delete(`/institutions/${id}`);
      await fetchInstitutions();
      showNotification('Instituição desativada com sucesso!', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Erro ao desativar instituição', 'error');
    }
  };

  const deleteCourse = async (id: number) => {
    try {
      await api.delete(`/courses/${id}`);
      await fetchCourses({});
      showNotification('Curso desativado com sucesso!', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Erro ao desativar curso', 'error');
    }
  };

  const handleMerge = async (sourceId: number, destinationId: number) => {
    try {
      await api.post(`/${entityType}s/merge`, { sourceId, destinationId });
      if (entityType === 'institution') {
        await fetchInstitutions();
      } else {
        await fetchCourses({});
      }
      showNotification('Entidades mescladas com sucesso!', 'success');
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Erro ao mesclar entidades', 'error');
    }
  };

  const openMergeModal = (entity: Instituicao | Course, type: 'institution' | 'course') => {
    setSourceEntity(entity);
    setEntityType(type);
    setIsMergeModalOpen(true);
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
      <MergeModal
        open={isMergeModalOpen}
        onClose={() => setIsMergeModalOpen(false)}
        sourceEntity={sourceEntity}
        entityType={entityType}
        onMerge={handleMerge}
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
              onMerge={(inst) => openMergeModal(inst, 'institution')}
            />
          )}
          {tabIndex === 1 && (
            <CursoCRUD
              courses={courses}
              loading={loadingCourses}
              onDelete={deleteCourse}
              onSearch={(options) => fetchCourses(options)}
              onEdit={(course) => setCourseToEdit(course)}
              onMerge={(course) => openMergeModal(course, 'course')}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default InstitutionCourseManagement;