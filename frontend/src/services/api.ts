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

// Interceptador de respostas: trata 401/403 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      // Mostrar snackbar informando o usuário e depois limpar token e redirecionar
      try {
        notify('Sessão expirada. Faça login novamente.', 'warning');
      } catch (e) {
        // ignore
      }
      // Pequeno timeout para permitir que o snackbar apareça antes do redirect
      setTimeout(() => {
        localStorage.removeItem('authToken');
        delete api.defaults.headers.common['Authorization'];
        try {
          window.location.href = '/login';
        } catch (e) {
          // ignore
        }
      }, 350);
    }
    return Promise.reject(error);
  }
);

export default api;