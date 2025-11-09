import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import HowToUseModal from './HowToUseModal';

const FIRST_VISIT_FLAG = 'has_seen_how_to_use';

const FirstVisitManager: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Não faça nada se o estado de autenticação ainda estiver carregando
    if (isLoading) {
      return;
    }

    // Só mostre o modal se o usuário estiver autenticado
    if (isAuthenticated) {
      const hasSeenModal = localStorage.getItem(FIRST_VISIT_FLAG);
      if (!hasSeenModal) {
        setModalOpen(true);
      }
    }
  }, [isAuthenticated, isLoading]);

  const handleClose = () => {
    localStorage.setItem(FIRST_VISIT_FLAG, 'true');
    setModalOpen(false);
  };

  // Renderiza o modal (que por padrão está invisível)
  return <HowToUseModal open={isModalOpen} onClose={handleClose} />;
};

export default FirstVisitManager;
