import React from 'react';
import { Box, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

type Props = {
  onSearch: () => void;
  onClear: () => void;
  searching?: boolean;
  searchLabel?: string;
};

const FilterActions: React.FC<Props> = ({ onSearch, onClear, searching = false, searchLabel = 'Procurar' }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={onSearch}
        disabled={searching}
        startIcon={<SearchIcon />}
        sx={{ height: 56, px: 3 }}
      >
        {searching ? 'Carregando...' : searchLabel}
      </Button>
      <Button variant="outlined" onClick={onClear} startIcon={<ClearIcon />} sx={{ height: 56 }}>
        Limpar filtros
      </Button>
    </Box>
  );
};

export default FilterActions;
