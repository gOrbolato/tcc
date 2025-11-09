import React, { useEffect, useState } from 'react';
import { Box, TextField, Autocomplete } from '@mui/material';
import FilterActions from './FilterActions';
import api from '../../../../services/api';
import type { Course } from '../../../../types/course';

interface Instituicao { id: number; nome: string; }
type Curso = Course;

export interface SearchOptions {
  institutionId?: number;
  courseId?: number;
  // Optional date range fields for trend comparisons (YYYY-MM-DD)
  currentStart?: string;
  currentEnd?: string;
  previousStart?: string;
  previousEnd?: string;
}

interface ReportFiltersProps {
  onSearch: (options: SearchOptions) => void;
  onClear: () => void;
  loading: boolean;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ onSearch, onClear, loading }) => {
  const [institutions, setInstitutions] = useState<Instituicao[]>([]);
  const [courses, setCourses] = useState<Curso[]>([]);
  const [selectedInstitution, setSelectedInstitution] = useState<Instituicao | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Curso | null>(null);

  useEffect(() => {
    api.get('/institutions').then(res => setInstitutions(res.data || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedInstitution) {
      setCourses([]);
      return;
    }
    api.get(`/institutions/${selectedInstitution.id}/courses`).then(res => setCourses(res.data || [])).catch(console.error);
  }, [selectedInstitution]);

  const handleSearch = () => {
    onSearch({
      institutionId: selectedInstitution?.id,
      courseId: selectedCourse?.id,
    });
  };

  const handleClear = () => {
    setSelectedInstitution(null);
    setSelectedCourse(null);
    onClear();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', gap: 2, flex: 1, minWidth: { xs: '100%', md: 400 } }}>
        <Autocomplete
          options={institutions}
          getOptionLabel={(opt) => opt.nome || ''}
          value={selectedInstitution}
          onChange={(e, v) => setSelectedInstitution(v)}
          renderInput={(params) => <TextField {...params} label="Instituição" />}
          sx={{ flex: 1 }}
        />
        <Autocomplete
          options={courses}
          getOptionLabel={(opt) => opt.nome || ''}
          value={selectedCourse}
          onChange={(e, v) => setSelectedCourse(v)}
          renderInput={(params) => <TextField {...params} label="Curso (Opcional)" />}
          disabled={!selectedInstitution}
          sx={{ flex: 1 }}
        />
      </Box>
      
      <Box>
        <FilterActions
          onSearch={handleSearch}
          onClear={handleClear}
          searching={loading}
        />
      </Box>
    </Box>
  );
};

export default ReportFilters;
