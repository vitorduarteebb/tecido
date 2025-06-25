import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRole } from '../types';
import Admin from '../models/Admin';
import Representante from '../models/Representante';
import { Cliente } from '../models/Cliente';
import { Model } from 'mongoose';

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
    console.log('[authMiddleware] Header Authorization recebido:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const [, token] = authHeader.split(' ');

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;

      // Seleciona o modelo correto baseado na role
      let UserModel: Model<any>;
      if (decoded.role === UserRole.CLIENTE) {
        // Busca o cliente pelo campo usuario
        const cliente = await Cliente.findOne({ usuario: decoded.id }).exec();
        if (!cliente) {
          return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        req.userId = cliente._id.toString();
        req.userRole = decoded.role;
        req.user = {
          id: cliente._id.toString(),
          email: cliente.email,
          role: UserRole.CLIENTE
        };
        return next();
      } else {
        switch (decoded.role) {
          case UserRole.ADMINISTRADOR:
            UserModel = Admin;
            break;
          case UserRole.REPRESENTANTE:
            UserModel = Representante;
            break;
          default:
            return res.status(401).json({ message: 'Role inválida no token' });
        }
        // Verifica se o usuário ainda existe no banco
        const user = await UserModel.findById(decoded.id).exec();
        if (!user) {
          return res.status(401).json({ message: 'Usuário não encontrado' });
        }
        req.userId = decoded.id;
        req.userRole = decoded.role;
        req.user = {
          id: decoded.id,
          role: decoded.role
        };
        return next();
      }
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