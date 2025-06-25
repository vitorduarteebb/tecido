"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clienteController = void 0;
const Cliente_1 = require("../models/Cliente");
const Usuario_1 = require("../models/Usuario");
const bcrypt_1 = __importDefault(require("bcrypt"));
exports.clienteController = {
    async listar(req, res) {
        try {
            const user = req.user;
            let clientes;
            if (user && user.role === 'ADMINISTRADOR') {
                clientes = await Cliente_1.Cliente.find().lean();
            }
            else if (user && user.role === 'REPRESENTANTE') {
                clientes = await Cliente_1.Cliente.find({ representantes: user.id }).lean();
            }
            else {
                return res.status(403).json({ success: false, message: 'Acesso negado' });
            }
            // Garante que todos tenham o campo representantes (array)
            const clientesComRepresentantes = clientes.map(c => (Object.assign(Object.assign({}, c), { representantes: c.representantes || [] })));
            return res.json({ success: true, data: clientesComRepresentantes, count: clientesComRepresentantes.length });
        }
        catch (error) {
            console.error('Erro ao listar clientes:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao listar clientes'
            });
        }
    },
    async obter(req, res) {
        try {
            const { id } = req.params;
            const cliente = await Cliente_1.Cliente.findById(id)
                .select('-usuario');
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente não encontrado'
                });
            }
            return res.json({
                success: true,
                data: cliente
            });
        }
        catch (error) {
            console.error('Erro ao obter cliente:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao obter cliente'
            });
        }
    },
    async criar(req, res) {
        try {
            const { razaoSocial, nomeFantasia, cnpj, inscricaoEstadual, email, telefone, celular, endereco, status, representante, limiteCredito, condicaoPagamento, credenciais } = req.body;
            // Verifica se já existe um cliente com o mesmo CNPJ
            const clienteExistente = await Cliente_1.Cliente.findOne({ cnpj });
            if (clienteExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Já existe um cliente cadastrado com este CNPJ'
                });
            }
            // Verifica se já existe um usuário com o mesmo email
            const usuarioExistente = await Usuario_1.Usuario.findOne({ email: credenciais.email });
            if (usuarioExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Já existe um usuário cadastrado com este email'
                });
            }
            // Cria o usuário com as credenciais
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(credenciais.senha, salt);
            const novoUsuario = await Usuario_1.Usuario.create({
                email: credenciais.email,
                senha: hashedPassword,
                role: 'CLIENTE'
            });
            // Novo: verifica se veio representanteId para vincular
            let representantes = [];
            if (req.body.representanteId) {
                representantes = [req.body.representanteId];
            }
            // Cria o cliente associado ao usuário
            const novoCliente = await Cliente_1.Cliente.create({
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
            const clienteResponse = novoCliente.toJSON();
            delete clienteResponse.usuario;
            return res.status(201).json({
                success: true,
                data: clienteResponse,
                message: 'Cliente cadastrado com sucesso'
            });
        }
        catch (error) {
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
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { razaoSocial, nomeFantasia, inscricaoEstadual, email, telefone, celular, endereco, representantes = [], limiteCredito, condicaoPagamento } = req.body;
            const reps = Array.isArray(representantes) ? representantes : [];
            const clienteAtualizado = await Cliente_1.Cliente.findByIdAndUpdate(id, {
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
            }, { new: true }).select('-usuario');
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
        }
        catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao atualizar cliente'
            });
        }
    },
    async excluir(req, res) {
        try {
            const { id } = req.params;
            const cliente = await Cliente_1.Cliente.findById(id);
            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente não encontrado'
                });
            }
            // Remove o usuário associado
            await Usuario_1.Usuario.findByIdAndDelete(cliente.usuario);
            // Remove o cliente
            await Cliente_1.Cliente.findByIdAndDelete(id);
            return res.json({
                success: true,
                message: 'Cliente excluído com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao excluir cliente:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao excluir cliente'
            });
        }
    },
    async alterarStatus(req, res) {
        try {
            const { id } = req.params;
            const { ativo } = req.body;
            const clienteAtualizado = await Cliente_1.Cliente.findByIdAndUpdate(id, { status: ativo ? 'ativo' : 'inativo' }, { new: true }).select('-usuario');
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
        }
        catch (error) {
            console.error('Erro ao alterar status do cliente:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao alterar status do cliente'
            });
        }
    }
};
