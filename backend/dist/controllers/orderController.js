"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachInvoice = exports.attachPaymentProof = exports.updateOrderStatus = exports.getOrderById = exports.listOrders = exports.createOrder = void 0;
const Order_1 = __importStar(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
// Criar pedido
const createOrder = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { cliente, itens } = req.body;
        // Verifica se o cliente existe
        const clienteExists = await User_1.default.findById(cliente);
        if (!clienteExists) {
            return res.status(404).json({ message: 'Cliente não encontrado' });
        }
        // Gera número único do pedido (ano + mês + sequencial)
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = await Order_1.default.countDocuments();
        const sequence = String(count + 1).padStart(6, '0');
        const numero = `${year}${month}${sequence}`;
        // Verifica e atualiza estoque dos produtos
        for (const item of itens) {
            const product = await Product_1.default.findById(item.produto);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `Produto ${item.produto} não encontrado` });
            }
            if (product.quantidadeEstoque < item.quantidade) {
                await session.abortTransaction();
                return res.status(400).json({
                    message: `Estoque insuficiente para o produto ${product.nome}`,
                    disponivel: product.quantidadeEstoque
                });
            }
            // Atualiza o estoque
            product.quantidadeEstoque -= item.quantidade;
            await product.save({ session });
            // Adiciona o preço atual do produto ao item
            item.precoUnitario = product.precoUnitario;
            item.total = item.quantidade * item.precoUnitario;
        }
        const order = new Order_1.default({
            numero,
            cliente,
            representante: req.userId, // ID do representante logado
            itens,
            status: Order_1.OrderStatus.PENDENTE,
            dataPedido: new Date()
        });
        await order.save({ session });
        await session.commitTransaction();
        res.status(201).json({
            message: 'Pedido criado com sucesso',
            order
        });
    }
    catch (error) {
        await session.abortTransaction();
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ message: 'Erro ao criar pedido' });
    }
    finally {
        session.endSession();
    }
};
exports.createOrder = createOrder;
// Listar pedidos
const listOrders = async (req, res) => {
    try {
        const { cliente, representante, status, dataInicio, dataFim } = req.query;
        const query = {};
        // Filtra por cliente se fornecido
        if (cliente)
            query.cliente = cliente;
        // Filtra por representante se fornecido
        if (representante)
            query.representante = representante;
        // Filtra por status se fornecido
        if (status)
            query.status = status;
        // Filtra por período se fornecido
        if (dataInicio || dataFim) {
            query.dataPedido = {};
            if (dataInicio)
                query.dataPedido.$gte = new Date(dataInicio);
            if (dataFim)
                query.dataPedido.$lte = new Date(dataFim);
        }
        // Se o usuário for um cliente, mostra apenas seus pedidos
        if (req.userRole === 'cliente') {
            query.cliente = req.userId;
        }
        // Se o usuário for um representante, mostra apenas seus pedidos
        if (req.userRole === 'representante') {
            query.representante = req.userId;
        }
        const orders = await Order_1.default.find(query)
            .populate('cliente', 'nome email')
            .populate('representante', 'nome email')
            .populate('itens.produto', 'nome codigo')
            .sort({ dataPedido: -1 });
        res.json(orders);
    }
    catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({ message: 'Erro ao listar pedidos' });
    }
};
exports.listOrders = listOrders;
// Buscar pedido por ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order_1.default.findById(req.params.id)
            .populate('cliente', 'nome email cpfCnpj endereco telefone')
            .populate('representante', 'nome email')
            .populate('itens.produto', 'nome codigo precoUnitario');
        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }
        // Verifica se o usuário tem permissão para ver o pedido
        if (req.userRole === 'cliente' && order.cliente._id.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso não autorizado' });
        }
        if (req.userRole === 'representante' && order.representante._id.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso não autorizado' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ message: 'Erro ao buscar pedido' });
    }
};
exports.getOrderById = getOrderById;
// Atualizar status do pedido
const updateOrderStatus = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { status } = req.body;
        const order = await Order_1.default.findById(req.params.id).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }
        // Verifica transições de status válidas
        const validTransitions = {
            [Order_1.OrderStatus.PENDENTE]: [Order_1.OrderStatus.APROVADO, Order_1.OrderStatus.REJEITADO, Order_1.OrderStatus.CANCELADO],
            [Order_1.OrderStatus.APROVADO]: [Order_1.OrderStatus.EM_PRODUCAO, Order_1.OrderStatus.CANCELADO],
            [Order_1.OrderStatus.EM_PRODUCAO]: [Order_1.OrderStatus.ENVIADO],
            [Order_1.OrderStatus.ENVIADO]: [Order_1.OrderStatus.ENTREGUE],
            [Order_1.OrderStatus.ENTREGUE]: [],
            [Order_1.OrderStatus.REJEITADO]: [],
            [Order_1.OrderStatus.CANCELADO]: []
        };
        if (!validTransitions[order.status].includes(status)) {
            await session.abortTransaction();
            return res.status(400).json({
                message: 'Transição de status inválida',
                statusAtual: order.status,
                statusPermitidos: validTransitions[order.status]
            });
        }
        // Atualiza o status
        order.status = status;
        // Atualiza datas conforme o status
        switch (status) {
            case Order_1.OrderStatus.APROVADO:
                order.dataAprovacao = new Date();
                break;
            case Order_1.OrderStatus.ENVIADO:
                order.dataEnvio = new Date();
                break;
            case Order_1.OrderStatus.ENTREGUE:
                order.dataEntrega = new Date();
                break;
            case Order_1.OrderStatus.CANCELADO:
                // Devolve os produtos ao estoque
                for (const item of order.itens) {
                    const product = await Product_1.default.findById(item.produto).session(session);
                    if (product) {
                        product.quantidadeEstoque += item.quantidade;
                        await product.save({ session });
                    }
                }
                break;
        }
        await order.save({ session });
        await session.commitTransaction();
        res.json({
            message: 'Status do pedido atualizado com sucesso',
            order
        });
    }
    catch (error) {
        await session.abortTransaction();
        console.error('Erro ao atualizar status do pedido:', error);
        res.status(500).json({ message: 'Erro ao atualizar status do pedido' });
    }
    finally {
        session.endSession();
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Anexar comprovante de pagamento
const attachPaymentProof = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }
        // Verifica se o usuário tem permissão para anexar o comprovante
        if (req.userRole === 'cliente' && order.cliente.toString() !== req.userId) {
            return res.status(403).json({ message: 'Acesso não autorizado' });
        }
        order.comprovantePagamento = req.file.filename;
        await order.save();
        res.json({
            message: 'Comprovante de pagamento anexado com sucesso',
            order
        });
    }
    catch (error) {
        console.error('Erro ao anexar comprovante:', error);
        res.status(500).json({ message: 'Erro ao anexar comprovante' });
    }
};
exports.attachPaymentProof = attachPaymentProof;
// Anexar nota fiscal
const attachInvoice = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }
        const order = await Order_1.default.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }
        // Apenas admin pode anexar nota fiscal
        if (req.userRole !== 'admin') {
            return res.status(403).json({ message: 'Acesso não autorizado' });
        }
        order.notaFiscal = req.file.filename;
        await order.save();
        res.json({
            message: 'Nota fiscal anexada com sucesso',
            order
        });
    }
    catch (error) {
        console.error('Erro ao anexar nota fiscal:', error);
        res.status(500).json({ message: 'Erro ao anexar nota fiscal' });
    }
};
exports.attachInvoice = attachInvoice;
