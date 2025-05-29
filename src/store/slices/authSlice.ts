import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMINISTRADOR' | 'REPRESENTANTE' | 'CLIENTE';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Carrega o estado inicial do localStorage
const loadInitialState = (): AuthState => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    return {
      user,
      token,
      isAuthenticated: !!(token && user)
    };
  } catch (error) {
    console.error('Erro ao carregar estado inicial:', error);
    return {
      user: null,
      token: null,
      isAuthenticated: false
    };
  }
};

const initialState: AuthState = loadInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      // Sincroniza com localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Limpa localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer; 