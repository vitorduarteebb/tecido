import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/database';
import { UserRole } from '../types';
import Admin from '../models/Admin';
import Representante from '../models/Representante';
import { Cliente } from '../models/Cliente';
import { Model } from 'mongoose';
import { Usuario } from '../models/Usuario';

const VALID_ROLES = ['ADMINISTRADOR', 'REPRESENTANTE', 'CLIENTE'] as const;
type ValidRole = typeof VALID_ROLES[number];

interface BaseUser {
  _id: string;
  email: string;
  senha: string;
  nome: string;
}

interface UserResponse {
  _id: string;
  email: string;
  nome: string;
  senha?: string;
  [key: string]: any;
}

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const { email, senha, role } = req.body;

      console.log('Login attempt:', { email, role });

      // Verifica se todos os campos necessários foram fornecidos
      if (!email || !senha || !role) {
        console.log('Missing required fields:', { email: !!email, senha: !!senha, role: !!role });
        return res.status(400).json({ 
          message: 'Email, senha e role são obrigatórios' 
        });
      }

      // Normaliza a role para maiúsculas
      const normalizedRole = role.toUpperCase() as ValidRole;
      console.log('Normalized role:', normalizedRole);

      // Valida se a role é válida
      if (!VALID_ROLES.includes(normalizedRole)) {
        console.log('Invalid role:', normalizedRole);
        return res.status(400).json({ 
          message: 'Role inválida',
          validRoles: VALID_ROLES
        });
      }

      // Seleciona o modelo correto baseado na role
      let UserModel: Model<any>;
      let user: any = null;
      let userResponse: any = null;
      let token: string = '';
      switch (normalizedRole) {
        case 'ADMINISTRADOR':
          UserModel = Admin;
          user = await UserModel.findOne({ email }).exec();
          if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
              message: 'Credenciais inválidas' 
            });
          }
          // Verifica a senha
          if (!await bcrypt.compare(senha, user.senha)) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ 
              message: 'Credenciais inválidas' 
            });
          }
          token = jwt.sign(
            { id: user._id, role: normalizedRole },
            config.jwtSecret,
            { expiresIn: '24h' }
          );
          userResponse = user.toObject();
          delete userResponse.senha;
          break;
        case 'REPRESENTANTE':
          UserModel = Representante;
          user = await UserModel.findOne({ email }).exec();
          if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
              message: 'Credenciais inválidas' 
            });
          }
          // Verifica a senha
          if (!await bcrypt.compare(senha, user.senha)) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ 
              message: 'Credenciais inválidas' 
            });
          }
          token = jwt.sign(
            { id: user._id, role: normalizedRole },
            config.jwtSecret,
            { expiresIn: '24h' }
          );
          userResponse = user.toObject();
          delete userResponse.senha;
          // Adiciona o id do representante como id e o id do usuário como userId (caso queira usar no futuro)
          userResponse.id = user._id;
          userResponse.userId = user._id; // Não há usuário separado para representante, então ambos são iguais
          break;
        case 'CLIENTE':
          // Busca o usuário pelo email e role CLIENTE
          const usuario = await Usuario.findOne({ email, role: 'CLIENTE' });
          if (!usuario) {
            console.log('Cliente user not found:', email);
            return res.status(401).json({ message: 'Credenciais inválidas' });
          }
          // Verifica a senha
          if (!await bcrypt.compare(senha, usuario.senha)) {
            console.log('Invalid password for cliente user:', email);
            return res.status(401).json({ message: 'Credenciais inválidas' });
          }
          // Busca o cliente associado ao usuário
          const cliente = await Cliente.findOne({ usuario: usuario._id });
          if (!cliente) {
            console.log('Cliente not found for user:', email);
            return res.status(401).json({ message: 'Cliente não encontrado' });
          }
          token = jwt.sign(
            { id: usuario._id, role: normalizedRole },
            config.jwtSecret,
            { expiresIn: '24h' }
          );
          userResponse = usuario.toObject();
          delete userResponse.senha;
          // Adiciona o id do cliente ao retorno
          userResponse.clienteId = cliente._id;
          break;
        default:
          console.log('Invalid role after validation (should not happen):', normalizedRole);
          return res.status(400).json({ 
            message: 'Role inválida' 
          });
      }

      console.log('Login successful:', { email, role: normalizedRole });

      // Retorna o token e os dados do usuário
      res.json({
        token,
        user: {
          ...userResponse,
          role: normalizedRole
        }
      });
    } catch (error) {
      console.error('Erro detalhado no login:', error);
      res.status(500).json({ 
        message: 'Erro ao realizar login',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
}; 