import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { UserRole } from '../types';
import { Admin, Representante, Cliente, Usuario } from '../models';

const VALID_ROLES = ['ADMINISTRADOR', 'REPRESENTANTE', 'CLIENTE'] as const;
type ValidRole = typeof VALID_ROLES[number];

interface BaseUser {
  id: string;
  email: string;
  senha: string;
  nome: string;
}

interface UserResponse {
  id: string;
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

      // Verifica se todos os campos necessarios foram fornecidos
      if (!email || !senha || !role) {
        console.log('Missing required fields:', { email: !!email, senha: !!senha, role: !!role });
        return res.status(400).json({ 
          message: 'Email, senha e role sao obrigatorios' 
        });
      }

      // Normaliza a role para maiusculas
      const normalizedRole = role.toUpperCase() as ValidRole;
      console.log('Normalized role:', normalizedRole);

      // Valida se a role e valida
      if (!VALID_ROLES.includes(normalizedRole)) {
        console.log('Invalid role:', normalizedRole);
        return res.status(400).json({ 
          message: 'Role invalida',
          validRoles: VALID_ROLES
        });
      }

      // Seleciona o modelo correto baseado na role
      let user: any = null;
      let userResponse: any = null;
      let token: string = '';
      
      switch (normalizedRole) {
        case 'ADMINISTRADOR':
          user = await Admin.findOne({ where: { email } });
          if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
              message: 'Credenciais invalidas' 
            });
          }
          // Verifica a senha
          if (!await bcrypt.compare(senha, user.senha)) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ 
              message: 'Credenciais invalidas' 
            });
          }
          token = jwt.sign(
            { id: user.id, role: normalizedRole },
            config.jwtSecret,
            { expiresIn: '24h' }
          );
          userResponse = user.toJSON();
          delete userResponse.senha;
          break;
        case 'REPRESENTANTE':
          user = await Representante.findOne({ where: { email } });
          if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ 
              message: 'Credenciais invalidas' 
            });
          }
          // Verifica a senha
          if (!await bcrypt.compare(senha, user.senha)) {
            console.log('Invalid password for user:', email);
            return res.status(401).json({ 
              message: 'Credenciais invalidas' 
            });
          }
          token = jwt.sign(
            { id: user.id, role: normalizedRole },
            config.jwtSecret,
            { expiresIn: '24h' }
          );
          userResponse = user.toJSON();
          delete userResponse.senha;
          // Adiciona o id do representante como id e o id do usuario como userId (caso queira usar no futuro)
          userResponse.id = user.id;
          userResponse.userId = user.id; // Nao ha usuario separado para representante, entao ambos sao iguais
          break;
        case 'CLIENTE':
          // Busca o usuario pelo email e role CLIENTE
          const usuario = await Usuario.findOne({ where: { email, role: 'CLIENTE' } });
          if (!usuario) {
            console.log('Cliente user not found:', email);
            return res.status(401).json({ message: 'Credenciais invalidas' });
          }
          // Verifica a senha
          if (!await bcrypt.compare(senha, usuario.senha)) {
            console.log('Invalid password for cliente user:', email);
            return res.status(401).json({ message: 'Credenciais invalidas' });
          }
          // Busca o cliente associado ao usuario
          const cliente = await Cliente.findOne({ where: { usuario: usuario.id } });
          if (!cliente) {
            console.log('Cliente not found for user:', email);
            return res.status(401).json({ message: 'Cliente nao encontrado' });
          }
          token = jwt.sign(
            { id: usuario.id, role: normalizedRole },
            config.jwtSecret,
            { expiresIn: '24h' }
          );
          userResponse = usuario.toJSON();
          delete userResponse.senha;
          // Adiciona o id do cliente ao retorno
          userResponse.clienteId = cliente.id;
          break;
        default:
          console.log('Invalid role after validation (should not happen):', normalizedRole);
          return res.status(400).json({ 
            message: 'Role invalida' 
          });
      }

      console.log('Login successful:', { email, role: normalizedRole });

      // Retorna o token e os dados do usuario
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