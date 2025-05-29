"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.representanteController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Representante_1 = __importDefault(require("../models/Representante"));
exports.representanteController = {
    // Listar todos os representantes
    listar: async (req, res) => {
        try {
            const representantes = await Representante_1.default.find().select('-senha');
            res.json(representantes);
        }
        catch (error) {
            console.error('Erro ao listar representantes:', error);
            res.status(500).json({ message: 'Erro ao listar representantes' });
        }
    },
    // Obter um representante específico
    obter: async (req, res) => {
        try {
            const representante = await Representante_1.default.findById(req.params.id).select('-senha');
            if (!representante) {
                return res.status(404).json({ message: 'Representante não encontrado' });
            }
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
            const { nome, email, telefone, regiao, senha } = req.body;
            // Verifica se já existe um representante com este email
            const representanteExistente = await Representante_1.default.findOne({ email });
            if (representanteExistente) {
                return res.status(400).json({ message: 'Email já cadastrado' });
            }
            // Hash da senha
            const salt = await bcryptjs_1.default.genSalt(10);
            const senhaHash = await bcryptjs_1.default.hash(senha, salt);
            const novoRepresentante = new Representante_1.default({
                nome,
                email,
                telefone,
                regiao,
                senha: senhaHash,
            });
            await novoRepresentante.save();
            // Retorna o representante sem a senha
            const { senha: _, ...representanteSemSenha } = novoRepresentante.toObject();
            res.status(201).json(representanteSemSenha);
        }
        catch (error) {
            console.error('Erro ao criar representante:', error);
            res.status(500).json({ message: 'Erro ao criar representante' });
        }
    },
    // Atualizar representante
    atualizar: async (req, res) => {
        try {
            const { nome, email, telefone, regiao } = req.body;
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
            const representante = await Representante_1.default.findByIdAndUpdate(id, { nome, email, telefone, regiao, dataAtualizacao: new Date() }, { new: true }).select('-senha');
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
};
