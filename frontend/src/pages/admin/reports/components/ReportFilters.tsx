import React, { useEffect, useState } from 'react';
import { Box, TextField, Autocomplete } from '@mui/material';
import FilterActions from './FilterActions';
import api from '../../../../services/api';
import type { Course } from '../../../../types/course';

interface Instituicao { id: number; nome: string; }
type Curso = Course;

interface ReportFiltersProps {
  onSearch: (institutionId?: number, courseId?: number) => void;
  onClear: () => void;
  loading: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ onSearch, onClear, loading }) => {
  const [institutions, setInstitutions] = useState<Instituicao[]>([]);
  const [courses, setCourses] = useState<Curso[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Instituicao | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/institutions');
        setInstitutions(res.data || []);
      } catch (err) {
        // Handle error
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!selectedInstitution) {
          setCourses([]);
          return;
        }
        const res = await api.get(`/institutions/${selectedInstitution.id}/courses`);
        setCourses(res.data || []);
      } catch (err) {
        // Handle error
      }
    })();
  }, [selectedInstitution]);

  const handleClear = () => {
    setSelectedInstitution(null);
    setSelectedCourse(null);
    onClear();
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: 300 }}>
        <Autocomplete
          options={institutions}
          getOptionLabel={(opt) => opt.nome || ''}
          value={selectedInstitution}
          onChange={(e, v) => setSelectedInstitution(v)}
          renderInput={(params) => <TextField {...params} label="Todas as Instituições" />}
          size="small"
          clearOnEscape
          sx={{ flex: 1, '& .MuiInputBase-root': { height: 56 }, '& .MuiInputBase-input': { display: 'flex', alignItems: 'center', height: '56px' } }}
        />
        <Autocomplete
          options={courses}
          getOptionLabel={(opt) => opt.nome || ''}
          value={selectedCourse}
          onChange={(e, v) => setSelectedCourse(v)}
          renderInput={(params) => <TextField {...params} label="Todos os Cursos" />}
          size="small"
          clearOnEscape
          disabled={!selectedInstitution}
          sx={{ width: 320, '& .MuiInputBase-root': { height: 56 }, '& .MuiInputBase-input': { display: 'flex', alignItems: 'center', height: '56px' } }}
        />
      </Box>

      <Box>
        <FilterActions
          onSearch={() => onSearch(selectedInstitution?.id, selectedCourse?.id)}
          onClear={handleClear}
          searching={loading}
        />
      </Box>
    </Box>
  );
};

export default ReportFilters;
