"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orcamentoController = void 0;
const Orcamento_1 = require("../models/Orcamento");
const Cliente_1 = require("../models/Cliente");
exports.orcamentoController = {
    async solicitar(req, res) {
        var _a;
        try {
            const { produtoId, quantidade, observacao } = req.body;
            const clienteId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.body.clienteId;
            if (!clienteId)
                return res.status(400).json({ success: false, message: 'Cliente não informado' });
            const cliente = await Cliente_1.Cliente.findById(clienteId);
            if (!cliente)
                return res.status(404).json({ success: false, message: 'Cliente não encontrado' });
            const representanteId = Array.isArray(cliente.representantes) ? cliente.representantes[0] : undefined;
            if (!representanteId)
                return res.status(403).json({ success: false, message: 'Cliente não possui representante vinculado' });
            const orcamento = await Orcamento_1.Orcamento.create({
                cliente: clienteId,
                representante: representanteId,
                produto: produtoId,
                quantidade,
                observacao,
                status: 'pendente',
            });
            return res.status(201).json({ success: true, data: orcamento, message: 'Solicitação de orçamento registrada' });
        }
        catch (error) {
            console.error('Erro ao solicitar orçamento:', error);
            return res.status(500).json({ success: false, message: 'Erro ao solicitar orçamento' });
        }
    },
    async listarPorRepresentante(req, res) {
        var _a;
        try {
            const representanteId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.params.representanteId;
            const orcamentos = await Orcamento_1.Orcamento.find({ representante: representanteId })
                .populate('cliente', 'nome razaoSocial')
                .populate('produto', 'nome codigo');
            return res.json({ success: true, data: orcamentos });
        }
        catch (error) {
            console.error('Erro ao listar orçamentos:', error);
            return res.status(500).json({ success: false, message: 'Erro ao listar orçamentos' });
        }
    },
    async atualizarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const orcamento = await Orcamento_1.Orcamento.findByIdAndUpdate(id, { status }, { new: true });
            if (!orcamento) {
                return res.status(404).json({ success: false, message: 'Orçamento não encontrado' });
            }
            return res.json({ success: true, data: orcamento });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: 'Erro ao atualizar status do orçamento' });
        }
    }
};
