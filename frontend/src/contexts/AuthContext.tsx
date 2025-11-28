// Importa React, hooks e tipos necessários.
import React, { createContext, useState, useContext, useEffect, useMemo, ReactNode } from 'react';
// Importa a instância da API para fazer requisições.
import api from '../services/api';
// Importa a função para decodificar tokens JWT.
import { jwtDecode } from 'jwt-decode';

// Interface que define a estrutura do objeto de usuário.
interface User {
  id: number;
  nome: string;
  isAdmin: boolean;
  is_active?: boolean;
  email?: string;
  ra?: string;
  is_trancado?: boolean;
  isViewOnly?: boolean;
  cpf?: string;
}

// Interface que define o formato do contexto de autenticação.
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, senha: string) => Promise<User>;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

// Cria o contexto de autenticação.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @component AuthProvider
 * @description Provedor de contexto que gerencia o estado de autenticação do usuário
 * em toda a aplicação. Ele lida com login, logout e validação de token.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efeito que roda na inicialização para validar um token existente no localStorage.
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          // Verifica se o token não expirou.
          if (decoded.exp * 1000 > Date.now()) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            // Busca os dados do perfil do usuário para garantir que a sessão é válida.
            const response = await api.get('/perfil');
            setUser(response.data);
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

  // Função de login.
  const login = async (email: string, senha: string) => {
    const response = await api.post('/auth/login', { email, senha });
    const { token, user: userData } = response.data;
    localStorage.setItem('authToken', token);
    setUser(userData);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return userData;
  };

  // Função de logout.
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  // Memoiza o valor do contexto para evitar re-renderizações desnecessárias dos consumidores.
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

/**
 * @hook useAuth
 * @description Hook customizado para facilitar o acesso ao contexto de autenticação.
 * Garante que o hook só seja usado dentro de um `AuthProvider`.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};