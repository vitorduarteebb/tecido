import { Request, Response } from 'express';
import { Cliente, ICliente } from '../models/Cliente';
import { Usuario } from '../models/Usuario';
import bcrypt from 'bcrypt';

export const clienteController = {
  async listar(req: Request, res: Response) {
    try {
      const user = req.user;
      let clientes;

      if (user && user.role === 'ADMINISTRADOR') {
        clientes = await Cliente.find().lean();
      } else if (user && user.role === 'REPRESENTANTE') {
        clientes = await Cliente.find({ representantes: user.id }).lean();
      } else {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }

      // Garante que todos tenham o campo representantes (array)
      const clientesComRepresentantes = clientes.map(c => ({
        ...c,
        representantes: c.representantes || []
      }));
      return res.json({ success: true, data: clientesComRepresentantes, count: clientesComRepresentantes.length });
    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar clientes'
      });
    }
  },

  async obter(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      console.log('[clienteController] Buscando cliente com ID:', id);
      
      const cliente = await Cliente.findById(id)
        .select('-usuario')
        .lean();

      if (!cliente) {
        console.log('[clienteController] Cliente não encontrado');
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      console.log('[clienteController] Cliente encontrado:', JSON.stringify(cliente, null, 2));

      return res.json({
        success: true,
        data: cliente
      });
    } catch (error) {
      console.error('Erro ao obter cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter cliente'
      });
    }
  },

  async criar(req: Request, res: Response) {
    try {
      const {
        razaoSocial,
        nomeFantasia,
        cnpj,
        inscricaoEstadual,
        email,
        telefone,
        celular,
        endereco,
        status,
        representante,
        limiteCredito,
        condicaoPagamento,
        credenciais
      } = req.body;

      // Verifica se já existe um cliente com o mesmo CNPJ
      const clienteExistente = await Cliente.findOne({ cnpj });

      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um cliente cadastrado com este CNPJ'
        });
      }

      // Verifica se já existe um usuário com o mesmo email
      const usuarioExistente = await Usuario.findOne({ email: credenciais.email });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um usuário cadastrado com este email'
        });
      }

      // Cria o usuário com as credenciais
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(credenciais.senha, salt);

      const novoUsuario = await Usuario.create({
        email: credenciais.email,
        senha: hashedPassword,
        role: 'CLIENTE'
      });

      // Novo: verifica se veio representanteId para vincular
      let representantes: string[] = [];
      if (req.body.representanteId) {
        representantes = [req.body.representanteId];
      }

      // Cria o cliente associado ao usuário
      const novoCliente = await Cliente.create({
        razaoSocial,
        nomeFantasia,
        cnpj,
        inscricaoEstadual,
        email,
        telefone,
        celular,
        endereco,
        status: status || 'ativo',
        representante,
        limiteCredito: Number(limiteCredito),
        condicaoPagamento,
        representantes,
        usuario: novoUsuario._id
      });

      // Remove o usuário dos dados retornados
      const clienteResponse = novoCliente.toJSON() as Record<string, any>;
      delete clienteResponse.usuario;

      return res.status(201).json({
        success: true,
        data: clienteResponse,
        message: 'Cliente cadastrado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      
      // Se houver erro, tenta remover o usuário criado para manter consistência
      if (error instanceof Error) {
        return res.status(500).json({
          success: false,
          message: `Erro ao criar cliente: ${error.message}`
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar cliente'
      });
    }
  },

  async atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        razaoSocial,
        nomeFantasia,
        inscricaoEstadual,
        email,
        telefone,
        celular,
        endereco,
        representantes = [],
        limiteCredito,
        condicaoPagamento
      } = req.body;

      const reps: string[] = Array.isArray(representantes) ? representantes : [];
      const clienteAtualizado = await Cliente.findByIdAndUpdate(
        id,
        {
          razaoSocial,
          nomeFantasia,
          inscricaoEstadual,
          email,
          telefone,
          celular,
          endereco,
          representantes: reps,
          limiteCredito,
          condicaoPagamento
        },
        { new: true }
      ).select('-usuario');

      if (!clienteAtualizado) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: clienteAtualizado,
        message: 'Cliente atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar cliente'
      });
    }
  },

  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      // Remove o usuário associado
      await Usuario.findByIdAndDelete(cliente.usuario);
      
      // Remove o cliente
      await Cliente.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: 'Cliente excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao excluir cliente'
      });
    }
  },

  async alterarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { ativo } = req.body;

      const clienteAtualizado = await Cliente.findByIdAndUpdate(
        id,
        { status: ativo ? 'ativo' : 'inativo' },
        { new: true }
      ).select('-usuario');

      if (!clienteAtualizado) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      return res.json({
        success: true,
        data: clienteAtualizado,
        message: 'Status do cliente atualizado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao alterar status do cliente'
      });
    }
  },

  async resetarSenha(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { novaSenha } = req.body;
      if (!novaSenha || novaSenha.length < 6) {
        return res.status(400).json({ success: false, message: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }
      // Busca o cliente
      const cliente = await Cliente.findById(id);
      if (!cliente) {
        return res.status(404).json({ success: false, message: 'Cliente não encontrado.' });
      }
      // Busca o usuário associado
      const usuario = await Usuario.findOne({ email: cliente.email, role: 'CLIENTE' });
      if (!usuario) {
        return res.status(404).json({ success: false, message: 'Usuário do cliente não encontrado.' });
      }
      // Atualiza a senha
      const salt = await bcrypt.genSalt(10);
      usuario.senha = await bcrypt.hash(novaSenha, salt);
      await usuario.save();
      return res.json({ success: true, message: 'Senha do cliente resetada com sucesso.' });
    } catch (error) {
      console.error('Erro ao resetar senha do cliente:', error);
      return res.status(500).json({ success: false, message: 'Erro ao resetar senha do cliente.' });
    }
  }
}; 