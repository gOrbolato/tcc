// Importa o React e hooks.
import React, { useState, useEffect } from 'react';
// Importa o hook de autenticação para verificar o status do usuário.
import { useAuth } from '../contexts/AuthContext';
// Importa o componente de modal que será exibido.
import HowToUseModal from './HowToUseModal';

// Chave utilizada para armazenar no localStorage se o usuário já viu o modal.
const FIRST_VISIT_FLAG = 'has_seen_how_to_use';

/**
 * @component FirstVisitManager
 * @description Este componente gerencia a exibição de um modal de "Como Usar"
 * para usuários autenticados na primeira vez que acessam a plataforma.
 * Ele verifica o `localStorage` para determinar se o modal já foi exibido.
 */
const FirstVisitManager: React.FC = () => {
  // Estado para controlar a visibilidade do modal.
  const [isModalOpen, setModalOpen] = useState(false);
  // Obtém o status de autenticação e carregamento do contexto.
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Se o estado de autenticação ainda estiver carregando, não faz nada.
    if (isLoading) {
      return;
    }

    // A lógica só é executada se o usuário estiver autenticado.
    if (isAuthenticated) {
      // Verifica no localStorage se o usuário já viu o modal.
      const hasSeenModal = localStorage.getItem(FIRST_VISIT_FLAG);
      // Se não tiver visto, abre o modal.
      if (!hasSeenModal) {
        setModalOpen(true);
      }
    }
  }, [isAuthenticated, isLoading]); // O efeito é re-executado quando o status de autenticação ou carregamento muda.

  // Função para fechar o modal e marcar que o usuário já o viu.
  const handleClose = () => {
    localStorage.setItem(FIRST_VISIT_FLAG, 'true');
    setModalOpen(false);
  };

  // Renderiza o modal, passando o estado de visibilidade e a função de fechar.
  return <HowToUseModal open={isModalOpen} onClose={handleClose} />;
};

export default FirstVisitManager;
