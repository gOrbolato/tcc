// Importa o hook `useSnackbar` da biblioteca `notistack` e tipos do React.
import { useSnackbar, VariantType } from 'notistack';
import React from 'react';

// Define o tipo para a variante da notificação, usando os tipos do notistack.
type NotificationType = VariantType; // ex: 'default', 'success', 'error', 'warning', 'info'

// Variável de escopo de módulo para armazenar a função de enfileirar snackbars.
// Isso permite que a função de notificação seja chamada de fora dos componentes React.
let globalEnqueue: ((msg: string, opts?: any) => void) | null = null;

/**
 * @hook useNotification
 * @description Hook customizado para exibir notificações (snackbars).
 * Ele abstrai o `useSnackbar` e fornece uma função `showNotification` mais simples.
 * Também mantém uma referência global para a função de enqueue.
 */
export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Efeito para atualizar a referência global `globalEnqueue` sempre que `enqueueSnackbar` mudar.
  React.useEffect(() => {
    globalEnqueue = (message: string, options?: any) => enqueueSnackbar(message, options);
    // Função de limpeza: remove a referência quando o componente que usa o hook é desmontado.
    return () => {
      globalEnqueue = null;
    };
  }, [enqueueSnackbar]);

  /**
   * @function showNotification
   * @description Função para exibir uma notificação na tela.
   * @param {string} message - A mensagem a ser exibida.
   * @param {NotificationType} [type='default'] - O tipo/variante da notificação.
   */
  const showNotification = React.useCallback((message: string, type: NotificationType = 'default') => {
    enqueueSnackbar(message, { variant: type });
  }, [enqueueSnackbar]);

  return { showNotification };
};

/**
 * @function notify
 * @description Função utilitária que permite disparar notificações de qualquer lugar
 * do código, inclusive de fora de componentes React (ex: em serviços de API).
 * @param {string} message - A mensagem a ser exibida.
 * @param {NotificationType} [type='default'] - O tipo da notificação.
 */
export const notify = (message: string, type: NotificationType = 'default') => {
  if (globalEnqueue) {
    globalEnqueue(message, { variant: type });
  } else {
    // Fallback: se a função global não estiver disponível, usa um alert simples.
    // Isso é raro, pois o SnackbarProvider é inicializado no topo da árvore de componentes.
    // eslint-disable-next-line no-alert
    alert(message);
  }
};

// Não há um `NotificationProvider` aqui porque o `SnackbarProvider` já cumpre esse papel
// e é configurado diretamente no `main.tsx`, envolvendo toda a aplicação.