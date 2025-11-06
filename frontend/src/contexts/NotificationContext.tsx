// src/contexts/NotificationContext.tsx
import { useSnackbar } from 'notistack';
import type { VariantType } from 'notistack';
import React from 'react';

// 1. Definir os tipos de notificação
type NotificationType = VariantType; // 'default', 'success', 'error', 'warning', 'info'

// 2. Variável global (module-scoped) para expor notify a arquivos não-React
let globalEnqueue: ((msg: string, opts?: any) => void) | null = null;

// 3. Criar o hook customizado
export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  // manter a referência global atualizada quando o hook é usado
  React.useEffect(() => {
    globalEnqueue = (message: string, options?: any) => enqueueSnackbar(message, options);
    return () => {
      // limpa a referência quando o componente que usa o hook desmonta
      globalEnqueue = null;
    };
  }, [enqueueSnackbar]);

  // 4. Criar a função que será chamada nas páginas
  // useCallback garante que a function identity seja estável entre renders
  const showNotification = React.useCallback((message: string, type: NotificationType = 'default') => {
    enqueueSnackbar(message, { variant: type });
  }, [enqueueSnackbar]);

  return { showNotification };
};

// 5. Função utilitária para usos fora de componentes React
export const notify = (message: string, type: NotificationType = 'default') => {
  if (globalEnqueue) {
    globalEnqueue(message, { variant: type });
  } else {
    // fallback: ainda podemos usar alert como último recurso
    // isto normalmente não será visto porque o SnackbarProvider é montado cedo em main.tsx
    // eslint-disable-next-line no-alert
    alert(message);
  }
};

// O NotificationProvider não é mais necessário, pois foi movido para main.tsx