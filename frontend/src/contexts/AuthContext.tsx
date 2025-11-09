import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import api from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  nome: string;
  isAdmin: boolean;
  is_active?: boolean; // Adicionado
  email?: string;
  ra?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Adicionado
  login: (email: string, senha: string) => Promise<User>;
  logout: () => void;
  // Expose the setter so pages can update the user (e.g. Perfil)
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Adicionado

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await api.get('/perfil');
            setUser(response.data); // Define o usuário com os dados completos da API
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (e) {
          console.error("Erro ao validar token:", e);
          localStorage.removeItem('authToken');
        }
      }
      setIsLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await api.post('/auth/login', { email, senha });
    const { token, user: userData } = response.data;
    localStorage.setItem('authToken', token);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  const memoizedValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={memoizedValue}>
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