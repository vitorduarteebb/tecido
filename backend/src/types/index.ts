export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  REPRESENTANTE = 'REPRESENTANTE',
  CLIENTE = 'CLIENTE'
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }
} 