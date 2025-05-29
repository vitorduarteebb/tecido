import api from './api';
import { AxiosError } from 'axios';

interface LoginCredentials {
  email: string;
  senha?: string;
  password?: string;
  role: 'ADMINISTRADOR' | 'REPRESENTANTE' | 'CLIENTE';
}

interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMINISTRADOR' | 'REPRESENTANTE' | 'CLIENTE';
  };
  token: string;
}

interface ErrorResponse {
  message: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      console.log('Tentando login com:', { ...credentials, senha: '[REDACTED]' });
      
      // Garante que a role está em maiúsculas
      credentials.role = credentials.role.toUpperCase() as LoginCredentials['role'];
      
      // Use senha if provided, otherwise use password
      const { password, senha, ...rest } = credentials;
      const requestData = {
        ...rest,
        senha: senha || password
      };
      
      const response = await api.post<LoginResponse>('/auth/login', requestData);
      console.log('Resposta do login:', {
        ...response.data,
        token: response.data.token ? '[PRESENTE]' : '[AUSENTE]',
        user: response.data.user ? {
          ...response.data.user,
          role: response.data.user.role
        } : null
      });
      
      if (!response.data.token) {
        throw new Error('Token não recebido do servidor');
      }

      if (!response.data.user) {
        throw new Error('Dados do usuário não recebidos do servidor');
      }

      // Garante que a role está em maiúsculas antes de armazenar
      const user = {
        ...response.data.user,
        role: response.data.user.role.toUpperCase() as LoginResponse['user']['role']
      };

      // Armazena tanto o token quanto os dados do usuário
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        token: response.data.token,
        user
      };
    } catch (error) {
      console.error('Erro detalhado do login:', (error as AxiosError<ErrorResponse>)?.response?.data || error);
      const axiosError = error as AxiosError<ErrorResponse>;
      if (axiosError.response?.data?.message) {
        throw new Error(axiosError.response.data.message);
      }
      throw new Error('Erro ao fazer login. Por favor, tente novamente.');
    }
  },

  logout: () => {
    console.log('Realizando logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Armazena o token de autenticação
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  // Obtém o token de autenticação armazenado
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // Verifica se o usuário está autenticado
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obtém os dados do usuário armazenados
  getUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('Nenhum usuário encontrado no localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      // Garante que a role está em maiúsculas
      if (user.role) {
        user.role = user.role.toUpperCase();
      }
      return user;
    } catch (error) {
      console.error('Erro ao parsear dados do usuário:', error);
      localStorage.removeItem('user'); // Remove dados inválidos
      return null;
    }
  }
}; 