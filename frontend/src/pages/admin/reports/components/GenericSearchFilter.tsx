// Importa React, hooks e componentes do Material-UI.
import React, { useState } from 'react';
import { Box, TextField } from '@mui/material';
// Importa o componente de ações de filtro.
import FilterActions from './FilterActions';

// Interface para as propriedades do componente.
interface GenericSearchFilterProps {
  onSearch: (query: string) => void; // Callback para quando a busca é acionada.
  onClear: () => void; // Callback para quando os filtros são limpos.
  loading: boolean; // Indica se uma busca está em andamento.
  placeholder?: string; // Texto de placeholder para o campo de busca.
  searchLabel?: string; // Rótulo para o botão de busca.
}

/**
 * @component GenericSearchFilter
 * @description Um componente de filtro de busca genérico, consistindo em um
 * campo de texto e os botões de "Buscar" e "Limpar".
 */
const GenericSearchFilter: React.FC<GenericSearchFilterProps> = ({
  onSearch,
  onClear,
  loading,
  placeholder = 'Buscar...',
  searchLabel = 'Buscar',
}) => {
  const [query, setQuery] = useState(''); // Estado para o valor do campo de busca.

  // Executa a busca com o valor atual do estado `query`.
  const handleSearch = () => {
    onSearch(query);
  };

  // Limpa o campo de busca e executa o callback `onClear`.
  const handleClear = () => {
    setQuery('');
    onClear();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      {/* Campo de texto para a busca. */}
      <TextField
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        fullWidth
        sx={{ flex: 1, minWidth: { xs: '100%', sm: 200 } }}
      />
      {/* Botões de ação. */}
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
