import axios from 'axios';

// Usando o proxy configurado no Vite
const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('[Axios Interceptor] URL da requisição:', config.url);
    console.log('[Axios Interceptor] Método da requisição:', config.method);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Interceptor] Enviando token no header Authorization:', token);
    } else {
      console.log('[Axios Interceptor] Nenhum token encontrado no localStorage');
    }
    return config;
  },
  (error) => {
    console.error('[Axios Interceptor] Erro no interceptor de requisição:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Garante que a role está em maiúsculas quando presente
    if (response.data?.user?.role) {
      response.data.user.role = response.data.user.role.toUpperCase();
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.error('Erro na requisição:', {
      url: originalRequest?.url,
      method: originalRequest?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      const errorMsg = error.response?.data?.message;
      // Só desloga se for token inválido ou expirado
      if (errorMsg && errorMsg.includes('Token inválido ou expirado')) {
        if (!originalRequest.url.includes('/auth/login')) {
          console.log('Token inválido ou expirado, limpando dados de autenticação');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (!window.location.pathname.includes('/login')) {
            console.log('Redirecionando para página de login');
            window.location.href = '/login';
          }
        }
      }
    }
    // Não desloga em 403, apenas rejeita
    return Promise.reject(error);
  }
);

export default api; 