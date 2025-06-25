"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.representanteController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Representante_1 = __importDefault(require("../models/Representante"));
const Cliente_1 = require("../models/Cliente");
exports.representanteController = {
    // Listar todos os representantes
    listar: async (req, res) => {
        try {
            console.log('Iniciando listagem de representantes');
            const representantes = await Representante_1.default.find()
                .select('-senha')
                .sort({ nome: 1 })
                .lean()
                .exec();
            const repsComId = representantes.map(rep => (Object.assign(Object.assign({}, rep), { id: rep._id.toString() })));
            console.log(`${repsComId.length} representantes encontrados`);
            return res.json({
                success: true,
                data: repsComId,
                count: repsComId.length
            });
        }
        catch (error) {
            console.error('Erro detalhado ao listar representantes:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro ao listar representantes',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    },
    // Obter um representante específico
    obter: async (req, res) => {
        try {
            const representante = await Representante_1.default.findById(req.params.id).select('-senha').lean();
            if (!representante) {
                return res.status(404).json({ message: 'Representante não encontrado' });
            }
            representante.id = representante._id.toString();
            res.json(representante);
        }
        catch (error) {
            console.error('Erro ao obter representante:', error);
            res.status(500).json({ message: 'Erro ao obter representante' });
        }
    },
    // Criar novo representante
    criar: async (req, res) => {
        try {
            const { nome, email, telefone, regiao, senha, comissao } = req.body;
            // Validação dos campos obrigatórios
            if (!nome || !email || !senha) {
                return res.status(400).json({
                    success: false,
                    message: 'Nome, email e senha são obrigatórios'
                });
            }
            // Verifica se já existe um representante com este email
            const representanteExistente = await Representante_1.default.findOne({ email });
            if (representanteExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado'
                });
            }
            // Hash da senha - garantindo que não seja undefined
            const senhaParaHash = String(senha || '');
            const salt = await bcryptjs_1.default.genSalt(10);
            const senhaHash = await bcryptjs_1.default.hash(senhaParaHash, salt);
            // Criar representante
            const novoRepresentante = new Representante_1.default({
                nome: nome.trim(),
                email: email.trim().toLowerCase(),
                telefone: (telefone === null || telefone === void 0 ? void 0 : telefone.trim()) || '',
                regiao: (regiao === null || regiao === void 0 ? void 0 : regiao.trim()) || '',
                senha: senhaHash,
                comissao: comissao || 0,
                status: 'Ativo'
            });
            await novoRepresentante.save();
            // Retorna sucesso sem a senha
            const representanteSemSenha = novoRepresentante.toObject();
            delete representanteSemSenha.senha;
            return res.status(201).json({
                success: true,
                message: 'Representante criado com sucesso',
                data: representanteSemSenha
            });
        }
        catch (error) {
            console.error('Erro ao criar representante:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    },
    // Atualizar representante
    atualizar: async (req, res) => {
        try {
            const { nome, email, telefone, regiao, comissao } = req.body;
            const { id } = req.params;
            // Se estiver atualizando o email, verifica se já existe
            if (email) {
                const representanteExistente = await Representante_1.default.findOne({
                    email,
                    _id: { $ne: id }
                });
                if (representanteExistente) {
                    return res.status(400).json({ message: 'Email já cadastrado' });
                }
            }
            const representante = await Representante_1.default.findByIdAndUpdate(id, { nome, email, telefone, regiao, comissao, dataAtualizacao: new Date() }, { new: true }).select('-senha');
            if (!representante) {
                return res.status(404).json({ message: 'Representante não encontrado' });
            }
            res.json(representante);
        }
        catch (error) {
            console.error('Erro ao atualizar representante:', error);
            res.status(500).json({ message: 'Erro ao atualizar representante' });
        }
    },
    // Excluir representante
    excluir: async (req, res) => {
        try {
            const representante = await Representante_1.default.findByIdAndDelete(req.params.id);
            if (!representante) {
                return res.status(404).json({ message: 'Representante não encontrado' });
            }
            res.json({ message: 'Representante excluído com sucesso' });
        }
        catch (error) {
            console.error('Erro ao excluir representante:', error);
            res.status(500).json({ message: 'Erro ao excluir representante' });
        }
    },
    // Alterar status do representante
    alterarStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { ativo } = req.body;
            const representante = await Representante_1.default.findByIdAndUpdate(id, {
                status: ativo ? 'Ativo' : 'Inativo',
                dataAtualizacao: new Date()
            }, { new: true }).select('-senha');
            if (!representante) {
                return res.status(404).json({ message: 'Representante não encontrado' });
            }
            res.json(representante);
        }
        catch (error) {
            console.error('Erro ao alterar status do representante:', error);
            res.status(500).json({ message: 'Erro ao alterar status do representante' });
        }
    },
    // Listar clientes vinculados a um representante
    listarClientes: async (req, res) => {
        try {
            const { id } = req.params;
            const clientes = await Cliente_1.Cliente.find({ representantes: id }).select('-usuario');
            return res.json({ success: true, data: clientes, count: clientes.length });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao listar clientes do representante' });
        }
    },
    // Vincular clientes a um representante
    vincularClientes: async (req, res) => {
        try {
            const { id } = req.params; // id do representante
            const { clientesIds } = req.body; // array de ids de clientes
            if (!Array.isArray(clientesIds)) {
                return res.status(400).json({ success: false, message: 'Informe um array de clientesIds' });
            }
            await Cliente_1.Cliente.updateMany({ _id: { $in: clientesIds } }, { $addToSet: { representantes: id } });
            return res.json({ success: true, message: 'Clientes vinculados com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao vincular clientes' });
        }
    },
    // Desvincular cliente de um representante
    desvincularCliente: async (req, res) => {
        try {
            const { id, clienteId } = req.params;
            await Cliente_1.Cliente.updateOne({ _id: clienteId }, { $pull: { representantes: id } });
            return res.json({ success: true, message: 'Cliente desvinculado com sucesso' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao desvincular cliente' });
        }
    },
};
