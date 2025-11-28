// Importa a biblioteca axios para fazer requisições HTTP.
import axios from 'axios';

/**
 * @file api.ts
 * @description Configuração central da instância do Axios para comunicação com a API do backend.
 * Inclui interceptadores para injetar o token de autenticação e para lidar com
 * erros de resposta de forma global.
 */

// Cria uma instância do axios com a URL base da API do backend.
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptador de Requisições (Request Interceptor)
// Este interceptador é executado ANTES de cada requisição ser enviada.
api.interceptors.request.use(
  (config) => {
    // Pega o token de autenticação do localStorage.
    const token = localStorage.getItem('authToken');
    // Se o token existir, adiciona-o ao cabeçalho 'Authorization' da requisição.
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Retorna a configuração modificada.
  },
  (error) => {
    // Se ocorrer um erro na configuração da requisição, rejeita a promessa.
    return Promise.reject(error);
  }
);

// Interceptador de Respostas (Response Interceptor)
// Este interceptador é executado DEPOIS que uma resposta da API é recebida.
api.interceptors.response.use(
  // Se a resposta for bem-sucedida (status 2xx), apenas a repassa.
  (response) => response,
  // Se ocorrer um erro na resposta...
  (error) => {
    // Se o erro for de "Não Autorizado" (401) ou "Proibido" (403),
    // remove o token inválido do localStorage. Isso ajudará o AuthContext
    // a identificar que o usuário não está mais logado.
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem('authToken');
    }
    // Rejeita a promessa com o erro, permitindo que ele seja tratado
    // no local da chamada da API (por exemplo, em um bloco `catch`).
    return Promise.reject(error);
  }
);

export default api;