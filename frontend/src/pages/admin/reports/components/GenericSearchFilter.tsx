import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
import FilterActions from './FilterActions';

interface GenericSearchFilterProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  loading: boolean;
  placeholder?: string;
  searchLabel?: string;
}

const GenericSearchFilter: React.FC<GenericSearchFilterProps> = ({
  onSearch,
  onClear,
  loading,
  placeholder = 'Buscar...',
  searchLabel = 'Buscar',
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
      />
      <FilterActions
        onSearch={handleSearch}
        onClear={handleClear}
        searching={loading}
        searchLabel={searchLabel}
      />
    </Box>
  );
};

export default GenericSearchFilter;
