// Importa React e componentes do Material-UI.
import React from 'react';
import { Box, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Define as propriedades que o componente aceita.
type Props = {
  onSearch: () => void; // Função para iniciar a busca.
  onClear: () => void; // Função para limpar os filtros.
  searching?: boolean; // Estado opcional para indicar se uma busca está em andamento.
  searchLabel?: string; // Rótulo opcional para o botão de busca.
};

/**
 * @component FilterActions
 * @description Um componente que renderiza os botões de ação para um formulário de filtro,
 * tipicamente "Procurar" e "Limpar filtros".
 */
const FilterActions: React.FC<Props> = ({ onSearch, onClear, searching = false, searchLabel = 'Procurar' }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* Botão de busca */}
      <Button
        variant="contained"
        color="primary"
        onClick={onSearch}
        disabled={searching} // Desabilita o botão durante a busca.
        startIcon={<SearchIcon />}
        sx={{ height: 56, px: 3 }}
      >
        {searching ? 'Carregando...' : searchLabel}
      </Button>
      {/* Botão para limpar os filtros */}
      <Button variant="outlined" onClick={onClear} startIcon={<ClearIcon />} sx={{ height: 56 }}>
        Limpar filtros
      </Button>
    </Box>
  );
};

export default FilterActions;
