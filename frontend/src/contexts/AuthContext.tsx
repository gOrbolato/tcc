import React, { createContext, useState, useContext, ReactNode } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode<any>(token);
        return {
          id: decoded.id,
          nome: decoded.nome,
          isAdmin: decoded.isAdmin,
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  });

  const login = async (email: string, senha: string) => {
    // Esta função agora funciona para ambos os tipos de usuário
    const response = await api.post('/auth/login', { email, senha });
    const { token, user: userData } = response.data;
    localStorage.setItem('authToken', token);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return userData; // Retorna os dados do usuário, incluindo 'isAdmin'
  };
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };
// Ajuste o valor fornecido pelo Provider
  const value = { user, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};