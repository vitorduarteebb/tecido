"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.listProducts = exports.createProduct = void 0;
const Product_1 = __importDefault(require("../models/Product"));
// Criar produto
const createProduct = async (req, res) => {
    try {
        const product = new Product_1.default(req.body);
        // Adiciona imagens se houver
        if (req.files) {
            const files = req.files;
            product.imagens = files.map(file => file.filename);
        }
        await product.save();
        res.status(201).json({
            message: 'Produto criado com sucesso',
            product
        });
    }
    catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ message: 'Erro ao criar produto' });
    }
};
exports.createProduct = createProduct;
// Listar produtos
const listProducts = async (req, res) => {
    try {
        const { categoria, ativo, search, minPreco, maxPreco } = req.query;
        const query = {};
        if (categoria)
            query.categoria = categoria;
        if (ativo !== undefined)
            query.ativo = ativo === 'true';
        if (search) {
            query.$or = [
                { nome: { $regex: search, $options: 'i' } },
                { descricao: { $regex: search, $options: 'i' } },
                { codigo: { $regex: search, $options: 'i' } }
            ];
        }
        if (minPreco || maxPreco) {
            query.precoUnitario = {};
            if (minPreco)
                query.precoUnitario.$gte = Number(minPreco);
            if (maxPreco)
                query.precoUnitario.$lte = Number(maxPreco);
        }
        const products = await Product_1.default.find(query).sort({ dataCriacao: -1 });
        res.json(products);
    }
    catch (error) {
        console.error('Erro ao listar produtos:', error);
        res.status(500).json({ message: 'Erro ao listar produtos' });
    }
};
exports.listProducts = listProducts;
// Buscar produto por ID
const getProductById = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ message: 'Erro ao buscar produto' });
    }
};
exports.getProductById = getProductById;
// Atualizar produto
const updateProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        // Atualiza os campos
        Object.assign(product, req.body);
        // Adiciona novas imagens se houver
        if (req.files) {
            const files = req.files;
            product.imagens = [...product.imagens, ...files.map(file => file.filename)];
        }
        await product.save();
        res.json({
            message: 'Produto atualizado com sucesso',
            product
        });
    }
    catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ message: 'Erro ao atualizar produto' });
    }
};
exports.updateProduct = updateProduct;
// Excluir produto (soft delete)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        product.ativo = false;
        await product.save();
        res.json({
            message: 'Produto excluído com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao excluir produto:', error);
        res.status(500).json({ message: 'Erro ao excluir produto' });
    }
};
exports.deleteProduct = deleteProduct;
// Atualizar estoque
const updateStock = async (req, res) => {
    try {
        const { quantidade } = req.body;
        const product = await Product_1.default.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        product.quantidadeEstoque += Number(quantidade);
        await product.save();
        res.json({
            message: 'Estoque atualizado com sucesso',
            product
        });
    }
    catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ message: 'Erro ao atualizar estoque' });
    }
};
exports.updateStock = updateStock;
