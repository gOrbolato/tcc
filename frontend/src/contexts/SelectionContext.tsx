import React, { createContext, useContext, useState } from 'react';

type SelectionContextType = {
  selectedInstitution: number | '';
  setSelectedInstitution: (v: number | '') => void;
  selectedCourse: number | '';
  setSelectedCourse: (v: number | '') => void;
};

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export const SelectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedInstitution, setSelectedInstitution] = useState<number | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<number | ''>('');
  return (
    <SelectionContext.Provider value={{ selectedInstitution, setSelectedInstitution, selectedCourse, setSelectedCourse }}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () => {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider');
  return ctx;
};

export default SelectionContext;
