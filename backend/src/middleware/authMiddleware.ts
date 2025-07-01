import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../types';
import Admin from '../models/Admin';
import Representante from '../models/Representante';
import { Cliente } from '../models/Cliente';
import { Model } from 'mongoose';
import Usuario from '../models/Usuario';

interface TokenPayload {
  id: string;
  role: UserRole;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('[authMiddleware] URL da requisição:', req.url);
    console.log('[authMiddleware] Método da requisição:', req.method);
    console.log('[authMiddleware] Header Authorization recebido:', authHeader);

    if (!authHeader) {
      console.log('[authMiddleware] Token não fornecido');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

      if (decoded.role === UserRole.CLIENTE) {
        // Busca o cliente pelo campo usuario
        const cliente = await Cliente.findOne({ where: { usuario: decoded.id } });
        if (!cliente) {
          return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        req.userId = String(cliente.id);
        req.userRole = decoded.role;
        req.user = {
          id: String(cliente.id),
          role: UserRole.CLIENTE
        };
        return next();
        }
      // Para outros roles, apenas seguir
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.user = {
          id: decoded.id,
          role: decoded.role
        };
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
      }
      throw error;
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
}; 