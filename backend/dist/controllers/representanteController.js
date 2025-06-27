"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
            console.log('=== DADOS RECEBIDOS PARA CRIAÇÃO DE REPRESENTANTE ===');
            console.log('Body completo:', JSON.stringify(req.body, null, 2));
            console.log('Headers:', JSON.stringify(req.headers, null, 2));
            const { nome, email, telefone, regiao, senha, comissao, status } = req.body;
            console.log('Campos extraídos:');
            console.log('- nome:', nome);
            console.log('- email:', email);
            console.log('- telefone:', telefone);
            console.log('- regiao:', regiao);
            console.log('- senha:', senha ? '***' : 'undefined');
            console.log('- comissao:', comissao);
            console.log('- status:', status);
            // Validação dos campos obrigatórios
            if (!nome || !email || !senha) {
                console.log('ERRO: Campos obrigatórios faltando');
                console.log('- nome presente:', !!nome);
                console.log('- email presente:', !!email);
                console.log('- senha presente:', !!senha);
                return res.status(400).json({
                    success: false,
                    message: 'Nome, email e senha são obrigatórios',
                    receivedData: { nome: !!nome, email: !!email, senha: !!senha }
                });
            }
            // Verifica se já existe um representante com este email
            const representanteExistente = await Representante_1.default.findOne({ email });
            if (representanteExistente) {
                console.log('ERRO: Email já cadastrado:', email);
                return res.status(400).json({
                    success: false,
                    message: 'Email já cadastrado'
                });
            }
            // Hash da senha - garantindo que não seja undefined
            const senhaParaHash = String(senha || '');
            console.log('Senha para hash (tamanho):', senhaParaHash.length);
            const salt = await bcryptjs_1.default.genSalt(10);
            const senhaHash = await bcryptjs_1.default.hash(senhaParaHash, salt);
            // Criar representante
            const dadosRepresentante = {
                nome: nome.trim(),
                email: email.trim().toLowerCase(),
                telefone: (telefone === null || telefone === void 0 ? void 0 : telefone.trim()) || '',
                regiao: (regiao === null || regiao === void 0 ? void 0 : regiao.trim()) || '',
                senha: senhaHash,
                comissao: comissao || 0,
                status: status || 'Ativo'
            };
            console.log('Dados para criação (sem senha):', Object.assign(Object.assign({}, dadosRepresentante), { senha: '***' }));
            const novoRepresentante = new Representante_1.default(dadosRepresentante);
            await novoRepresentante.save();
            console.log('Representante criado com sucesso, ID:', novoRepresentante._id);
            // Retorna sucesso sem a senha
            const representanteSemSenha = novoRepresentante.toObject();
            const { senha: _ } = representanteSemSenha, representanteSemSenhaFinal = __rest(representanteSemSenha, ["senha"]);
            return res.status(201).json({
                success: true,
                message: 'Representante criado com sucesso',
                data: representanteSemSenhaFinal
            });
        }
        catch (error) {
            console.error('Erro ao criar representante:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
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
