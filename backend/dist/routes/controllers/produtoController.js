"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.produtoController = void 0;
const models_1 = require("../models");
exports.produtoController = {
    async listar(req, res) {
        try {
            console.log('[produtoController] Iniciando listagem de produtos');
            const produtos = await models_1.Produto.findAll({
                order: [['dataCadastro', 'DESC']]
            });
            console.log('[produtoController] Produtos encontrados:', produtos.length);
            return res.json({ success: true, data: produtos, count: produtos.length });
        }
        catch (error) {
            console.error('[produtoController] Erro ao listar produtos:', error);
            return res.status(500).json({ success: false, message: 'Erro ao listar produtos' });
        }
    },
    async obter(req, res) {
        try {
            const { id } = req.params;
            const produto = await models_1.Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ success: false, message: 'Produto não encontrado' });
            }
            return res.json({ success: true, data: produto });
        }
        catch (error) {
            console.error('Erro ao obter produto:', error);
            return res.status(500).json({ success: false, message: 'Erro ao obter produto' });
        }
    },
    async criar(req, res) {
        try {
            const { precoAVista, precoAPrazo, pesoPorMetro, imagem } = req.body;
            if (precoAVista === undefined || precoAPrazo === undefined || pesoPorMetro === undefined) {
                return res.status(400).json({ success: false, message: 'Campos obrigatórios: precoAVista, precoAPrazo, pesoPorMetro' });
            }
            let imagemFinal = imagem;
            if (imagem && !imagem.startsWith('/uploads/')) {
                imagemFinal = `/uploads/${imagem}`;
            }
            const novoProduto = await models_1.Produto.create(Object.assign(Object.assign({}, req.body), { imagem: imagemFinal }));
            return res.status(201).json({ success: true, data: novoProduto, message: 'Produto cadastrado com sucesso' });
        }
        catch (error) {
            console.error('Erro ao criar produto:', error);
            return res.status(500).json({ success: false, message: 'Erro ao criar produto' });
        }
    },
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const { precoAVista, precoAPrazo, pesoPorMetro, imagem } = req.body;
            if (precoAVista === undefined || precoAPrazo === undefined || pesoPorMetro === undefined) {
                return res.status(400).json({ success: false, message: 'Campos obrigatórios: precoAVista, precoAPrazo, pesoPorMetro' });
            }
            const produto = await models_1.Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ success: false, message: 'Produto não encontrado' });
            }
            let imagemFinal = imagem;
            if (imagem && !imagem.startsWith('/uploads/')) {
                imagemFinal = `/uploads/${imagem}`;
            }
            const produtoAtualizado = await produto.update(Object.assign(Object.assign({}, req.body), { imagem: imagemFinal }));
            return res.json({ success: true, data: produtoAtualizado, message: 'Produto atualizado com sucesso' });
        }
        catch (error) {
            console.error('Erro ao atualizar produto:', error);
            return res.status(500).json({ success: false, message: 'Erro ao atualizar produto' });
        }
    },
    async excluir(req, res) {
        try {
            const { id } = req.params;
            const produto = await models_1.Produto.findByPk(id);
            if (!produto) {
                return res.status(404).json({ success: false, message: 'Produto não encontrado' });
            }
            await produto.destroy();
            return res.json({ success: true, message: 'Produto excluído com sucesso' });
        }
        catch (error) {
            console.error('Erro ao excluir produto:', error);
            return res.status(500).json({ success: false, message: 'Erro ao excluir produto' });
        }
    }
};
