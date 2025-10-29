// src/contexts/NotificationContext.tsx
import { useSnackbar } from 'notistack';
import type { VariantType } from 'notistack';

// 1. Definir os tipos de notificação
type NotificationType = VariantType; // 'default', 'success', 'error', 'warning', 'info'

// 2. Criar o hook customizado
export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  // 3. Criar a função que será chamada nas páginas
  const showNotification = (message: string, type: NotificationType = 'default') => {
    enqueueSnackbar(message, { variant: type });
  };

  return { showNotification };
};

// O NotificationProvider não é mais necessário, pois foi movido para main.tsx