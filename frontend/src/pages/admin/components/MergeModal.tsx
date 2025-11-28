// Importa React, hooks e componentes do Material-UI.
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemText, CircularProgress, Typography } from '@mui/material';
// Importa a instância da API.
import api from '../../../services/api';

// Interface genérica para uma entidade que pode ser mesclada.
interface MergeableEntity {
  id: number;
  nome: string;
}

// Interface para as propriedades do modal. Usa um tipo genérico `T`.
interface MergeModalProps<T extends MergeableEntity> {
  open: boolean;
  onClose: () => void;
  sourceEntity: T | null; // A entidade que será mesclada e depois removida.
  entityType: 'institution' | 'course'; // O tipo da entidade.
  onMerge: (sourceId: number, destinationId: number) => Promise<void>; // Callback para executar a mesclagem.
}

/**
 * @component MergeModal
 * @description Um modal genérico para mesclar duas entidades (instituições ou cursos).
 * O usuário seleciona uma entidade de origem e depois busca e seleciona uma entidade de destino.
 * Todos os dados associados à origem são migrados para o destino.
 */
const MergeModal = <T extends MergeableEntity>({
  open,
  onClose,
  sourceEntity,
  entityType,
  onMerge,
}: MergeModalProps<T>) => {
  const [destinationEntity, setDestinationEntity] = useState<T | null>(null); // Entidade de destino.
  const [entities, setEntities] = useState<T[]>([]); // Lista de entidades para escolher como destino.
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(''); // Termo de busca para encontrar a entidade de destino.

  // Efeito para buscar as entidades quando o modal abre ou a query de busca muda.
  useEffect(() => {
    if (open) {
      fetchEntities();
    }
  }, [open, query]);

  // Função para buscar as entidades (instituições ou cursos) da API.
  const fetchEntities = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${entityType}s?q=${query}`);
      // Filtra para remover a própria entidade de origem da lista de destinos possíveis.
      setEntities(res.data.filter((e: T) => e.id !== sourceEntity?.id));
    } catch (error) {
      console.error(`Error fetching ${entityType}s:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Executa a função de mesclagem passada por props.
  const handleMerge = async () => {
    if (sourceEntity && destinationEntity) {
      await onMerge(sourceEntity.id, destinationEntity.id);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mesclar {entityType === 'institution' ? 'Instituição' : 'Curso'}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Você está prestes a mesclar <strong>{sourceEntity?.nome}</strong> com outra entidade. Todas as referências a esta entidade serão migradas para a entidade de destino.
        </Typography>
        <TextField
          label={`Buscar ${entityType === 'institution' ? 'instituição' : 'curso'} de destino`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          margin="normal"
        />
        {loading ? <CircularProgress /> : (
          <List>
            {entities.map((entity) => (
              <ListItem
                button
                key={entity.id}
                selected={destinationEntity?.id === entity.id} // Destaca a entidade de destino selecionada.
                onClick={() => setDestinationEntity(entity)}
              >
                <ListItemText primary={entity.nome} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleMerge} disabled={!destinationEntity}>
          Mesclar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MergeModal;
