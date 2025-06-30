import { Request, Response } from 'express';
import { Cliente, Usuario } from '../models';
import bcrypt from 'bcrypt';

export const clienteController = {
  async listar(req: Request, res: Response) {
    try {
      const user = req.user;
      let clientes;

      if (user && user.role === 'ADMINISTRADOR') {
        clientes = await Cliente.findAll();
      } else if (user && user.role === 'REPRESENTANTE') {
        clientes = await Cliente.findAll({
          where: {
            representantes: user.id
          }
        });
      } else {
        return res.status(403).json({ success: false, message: 'Acesso negado' });
      }

      // Garante que todos tenham o campo representantes (array)
      const clientesComRepresentantes = clientes.map(c => ({
        ...c.toJSON(),
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
      
      const cliente = await Cliente.findByPk(id);

      if (!cliente) {
        console.log('[clienteController] Cliente não encontrado');
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      console.log('[clienteController] Cliente encontrado:', JSON.stringify(cliente.toJSON(), null, 2));

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
      const clienteExistente = await Cliente.findOne({ where: { cnpj } });

      if (clienteExistente) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um cliente cadastrado com este CNPJ'
        });
      }

      // Verifica se já existe um usuário com o mesmo email
      const usuarioExistente = await Usuario.findOne({ where: { email: credenciais.email } });
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
      let representantes: string = '';
      if (req.body.representanteId) {
        representantes = req.body.representanteId;
      }

      const reps: string = Array.isArray(representantes) ? representantes.join(',') : representantes;

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
        representantes: reps,
        usuario: novoUsuario.id
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

      const reps: string = Array.isArray(representantes) ? representantes.join(',') : representantes;
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      const clienteAtualizado = await cliente.update({
        razaoSocial,
        nomeFantasia,
        inscricaoEstadual,
        email,
        telefone,
        celular,
        endereco,
        representantes: reps
      });

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
      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      await cliente.destroy();

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
      const { status } = req.body;

      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      await cliente.update({ status });

      return res.json({
        success: true,
        message: 'Status do cliente alterado com sucesso'
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

      const cliente = await Cliente.findByPk(id);
      
      if (!cliente) {
        return res.status(404).json({
          success: false,
          message: 'Cliente não encontrado'
        });
      }

      // Busca o usuário associado ao cliente
      const usuario = await Usuario.findByPk(cliente.usuario);
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário do cliente não encontrado'
        });
      }

      // Gera nova senha hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(novaSenha, salt);

      // Atualiza a senha do usuário
      await usuario.update({ senha: hashedPassword });

      return res.json({
        success: true,
        message: 'Senha do cliente resetada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao resetar senha do cliente:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao resetar senha do cliente'
      });
    }
  }
}; 