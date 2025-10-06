import axios from 'axios';

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

export default api;