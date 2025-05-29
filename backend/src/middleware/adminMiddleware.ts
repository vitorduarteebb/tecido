import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';

export const adminMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Verifica se o usuário e a role estão presentes
    if (!req.user || !req.userRole) {
      return res.status(401).json({ 
        message: 'Usuário não autenticado' 
      });
    }

    // Normaliza a role para comparação
    const userRole = req.userRole.toUpperCase();
    const adminRole = UserRole.ADMINISTRADOR.toUpperCase();

    if (userRole !== adminRole) {
      console.log('Acesso negado - Role do usuário:', userRole, 'Role necessária:', adminRole);
      return res.status(403).json({ 
        message: 'Acesso negado. Apenas administradores podem acessar este recurso.',
        userRole: userRole,
        requiredRole: adminRole
      });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de admin:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 