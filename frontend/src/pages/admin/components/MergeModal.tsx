import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
} from '@mui/material';
import api from '../../../services/api';

interface MergeableEntity {
  id: number;
  nome: string;
}

interface MergeModalProps<T extends MergeableEntity> {
  open: boolean;
  onClose: () => void;
  sourceEntity: T | null;
  entityType: 'institution' | 'course';
  onMerge: (sourceId: number, destinationId: number) => Promise<void>;
}

const MergeModal = <T extends MergeableEntity>({
  open,
  onClose,
  sourceEntity,
  entityType,
  onMerge,
}: MergeModalProps<T>) => {
  const [destinationEntity, setDestinationEntity] = useState<T | null>(null);
  const [entities, setEntities] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) {
      fetchEntities();
    }
  }, [open, query]);

  const fetchEntities = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${entityType}s?q=${query}`);
      setEntities(res.data.filter((e: T) => e.id !== sourceEntity?.id));
    } catch (error) {
      console.error(`Error fetching ${entityType}s:`, error);
    } finally {
      setLoading(false);
    }
  };

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
          Você está prestes a mesclar{' '}
          <strong>{sourceEntity?.nome}</strong> com outra entidade. Todas as referências a esta entidade serão
          migradas para a entidade de destino.
        </Typography>
        <TextField
          label={`Buscar ${entityType === 'institution' ? 'instituição' : 'curso'} de destino`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          margin="normal"
        />
        {loading ? (
          <CircularProgress />
        ) : (
          <List>
            {entities.map((entity) => (
              <ListItem
                button
                key={entity.id}
                selected={destinationEntity?.id === entity.id}
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
