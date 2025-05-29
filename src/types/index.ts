export type UserRole = 'ADMIN' | 'REPRESENTANTE' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  senha: string;
  role: UserRole;
}

export * from './cliente'; 