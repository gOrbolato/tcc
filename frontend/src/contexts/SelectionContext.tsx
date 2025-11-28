// Importa as funções e tipos necessários do React.
import React, { createContext, useContext, useState } from 'react';

// Define a tipagem para os valores que o contexto irá fornecer.
type SelectionContextType = {
  selectedInstitution: number | ''; // ID da instituição selecionada, ou string vazia se nenhuma.
  setSelectedInstitution: (v: number | '') => void; // Função para atualizar a instituição selecionada.
  selectedCourse: number | ''; // ID do curso selecionado, ou string vazia se nenhum.
  setSelectedCourse: (v: number | '') => void; // Função para atualizar o curso selecionado.
};

// Cria o contexto de seleção com um valor inicial indefinido.
const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

/**
 * @component SelectionProvider
 * @description Um provedor de contexto que armazena e fornece o estado da
 * instituição e do curso selecionados globalmente na aplicação.
 * Isso é útil para filtros em dashboards e formulários.
 */
export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para armazenar o ID da instituição selecionada.
  const [selectedInstitution, setSelectedInstitution] = useState<number | ''>('');
  // Estado para armazenar o ID do curso selecionado.
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');

  return (
    // Fornece os estados e as funções de atualização para os componentes filhos.
    <SelectionContext.Provider value={{ selectedInstitution, setSelectedInstitution, selectedCourse, setSelectedCourse }}>
      {children}
    </SelectionContext.Provider>
  );
};

/**
 * @hook useSelection
 * @description Hook customizado para consumir facilmente o `SelectionContext`.
 * @returns {SelectionContextType} O valor do contexto, contendo os estados e setters.
 * @throws {Error} Se o hook for usado fora de um `SelectionProvider`.
 */
export const useSelection = (): SelectionContextType => {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    throw new Error('useSelection deve ser usado dentro de um SelectionProvider');
  }
  return ctx;
};

// Exporta o contexto para uso potencial em cenários avançados (raro).
export default SelectionContext;
