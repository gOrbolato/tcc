import axios from 'axios';
import { notify } from '../contexts/NotificationContext';

// Cria uma instância do axios com a URL base da sua API
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Endereço do seu backend
});

// Interceptador de requisições: Adiciona o token de autenticação em cada chamada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptador de respostas: Apenas repassa a resposta ou o erro.
// O tratamento de erro (como 401/403) deve ser feito no AuthContext ou nos componentes
// que fazem a chamada, para evitar conflitos de roteamento.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // O erro é simplesmente rejeitado e será capturado pelo bloco .catch() da chamada da API.
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Limpa o token para que o AuthContext possa lidar com o estado de deslogado.
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export default api;