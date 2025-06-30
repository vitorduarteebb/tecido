"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.movimentacaoEstoqueController = void 0;
const models_1 = require("../models");
exports.movimentacaoEstoqueController = {
    async registrar(req, res) {
        try {
            const { id } = req.params;
            const { tipo, quantidade, usuario, observacao } = req.body;
            if (!['entrada', 'saida'].includes(tipo)) {
                return res.status(400).json({ success: false, message: 'Tipo inválido' });
            }
            const produto = await models_1.Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ success: false, message: 'Produto não encontrado' });
            }
            // Atualiza o estoque do produto
            let novaQuantidade = produto.estoque.quantidade;
            if (tipo === 'entrada')
                novaQuantidade += quantidade;
            else if (tipo === 'saida')
                novaQuantidade -= quantidade;
            if (novaQuantidade < 0) {
                return res.status(400).json({ success: false, message: 'Estoque insuficiente' });
            }
            produto.estoque.quantidade = novaQuantidade;
            await produto.save();
            // Registra a movimentação
            const mov = await models_1.MovimentacaoEstoque.create({
                produtoId: produto.id,
                tipo,
                quantidade,
                usuario,
                observacao
            });
            return res.status(201).json({ success: true, data: mov, estoqueAtual: novaQuantidade });
        }
        catch (error) {
            console.error('Erro ao registrar movimentação:', error);
            return res.status(500).json({ success: false, message: 'Erro ao registrar movimentação' });
        }
    },
    async listar(req, res) {
        try {
            const { id } = req.params;
            const movs = await models_1.MovimentacaoEstoque.findAll({
                where: { produtoId: id },
                order: [['data', 'DESC']]
            });
            return res.json({ success: true, data: movs });
        }
        catch (error) {
            console.error('Erro ao listar movimentações:', error);
            return res.status(500).json({ success: false, message: 'Erro ao listar movimentações' });
        }
    }
};
